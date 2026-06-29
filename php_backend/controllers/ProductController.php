<?php
require_once __DIR__ . '/BaseController.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../utils/Response.php';
require_once __DIR__ . '/../utils/ActivityLogger.php';

class ProductController extends BaseController {
    private $productModel;

    public function __construct($db) {
        parent::__construct($db);
        $this->productModel = new Product($db);
    }

    public function handleRequest() {
        $method = $_SERVER['REQUEST_METHOD'];
        $id = isset($_GET['id']) ? intval($_GET['id']) : null;
        $action = isset($_GET['action']) ? trim($_GET['action']) : '';

        if ($id === null || $action === '') {
            $body = $this->getBody();
            if ($id === null && isset($body['id'])) $id = intval($body['id']);
            if ($action === '' && isset($body['action'])) $action = trim((string)$body['action']);
        }

        switch ($method) {
            case 'GET':
                if ($action === 'velocity') {
                    $this->getVelocitySummary();
                } else if ($action === 'cost_summary') {
                    $this->getCostSummary();
                } else if ($id && $action === 'movements') {
                    $this->getProductMovements($id);
                } else if ($id) {
                    $this->getProduct($id);
                } else {
                    $this->getAllProducts();
                }
                break;
            case 'POST':
                if ($id && $action === 'restock') {
                    $this->restockProduct($id);
                } else if ($id && $action === 'consume') {
                    $this->consumeProduct($id);
                } else {
                    $this->createProduct();
                }
                break;
            case 'PUT':
                if ($id) {
                    $this->updateProduct($id);
                } else {
                    Response::error('ID is required for update', 400);
                }
                break;
            case 'DELETE':
                if ($id) {
                    $this->deleteProduct($id);
                } else {
                    Response::error('ID is required for deletion', 400);
                }
                break;
            default:
                Response::error('Method not allowed', 405);
                break;
        }
    }

    private function getAllProducts() {
        $products = $this->productModel->getAll();
        Response::json($products);
    }

    private function getProduct($id) {
        $product = $this->productModel->getById($id);
        if ($product) {
            Response::json($product);
        } else {
            Response::error('Product not found', 404);
        }
    }

    private function createProduct() {
        $data = $this->getBody();

        if (empty($data['name'])) {
            Response::error('Name is required', 400);
        }

        $productType = $data['product_type'] ?? 'Saleable';
        if ($productType === 'Saleable' && !isset($data['price'])) {
            Response::error('Sale price is required for saleable products', 400);
        }

        $trackingMode = strtolower((string)($data['tracking_mode'] ?? 'units'));
        if ($trackingMode === 'level') {
            if (!isset($data['quantity_remaining'])) {
                Response::error('Quantity remaining is required for depreciating products', 400);
            }
            if (!isset($data['initial_quantity']) || $data['initial_quantity'] === '' || floatval($data['initial_quantity']) <= 0) {
                $data['initial_quantity'] = floatval($data['quantity_remaining']);
            }
        } else {
            if (!isset($data['stock_quantity'])) {
                Response::error('Stock quantity is required for unit products', 400);
            }
            if (!isset($data['initial_quantity']) || $data['initial_quantity'] === '' || floatval($data['initial_quantity']) <= 0) {
                $data['initial_quantity'] = floatval($data['stock_quantity']);
            }
        }

        $data = $this->applyCostValuation($data);
        $data['status'] = $this->resolveInventoryStatus($data);

        $id = $this->productModel->create($data);
        if ($id) {
            $newProduct = $this->productModel->getById($id);
            ActivityLogger::logFromAuthData($this->conn, 'product', 'create', "Created product #{$id}", null, 'product', $id);
            Response::json(['message' => 'Product created successfully', 'product' => $newProduct], 201);
        } else {
            Response::error('Failed to create product', 500);
        }
    }

    private function updateProduct($id) {
        $data = $this->getBody();

        $existing = $this->productModel->getById($id);
        if (!$existing) {
            Response::error('Product not found', 404);
        }

        $merged = array_merge($existing, $data);
        $trackingMode = strtolower((string)($merged['tracking_mode'] ?? 'units'));
        if (!isset($merged['initial_quantity']) || floatval($merged['initial_quantity']) <= 0) {
            $merged['initial_quantity'] = $trackingMode === 'level'
                ? floatval($merged['quantity_remaining'] ?? 0)
                : floatval($merged['stock_quantity'] ?? 0);
            $data['initial_quantity'] = $merged['initial_quantity'];
        }
        $merged = $this->applyCostValuation($merged);
        $merged['status'] = $this->resolveInventoryStatus($merged);
        $data['initial_cost'] = $merged['initial_cost'];
        $data['remaining_value'] = $merged['remaining_value'];
        $data['status'] = $merged['status'];

        if ($this->productModel->update($id, $data)) {
            $updatedProduct = $this->productModel->getById($id);
            ActivityLogger::logFromAuthData($this->conn, 'product', 'update', "Updated product #{$id}", null, 'product', $id);
            Response::json(['message' => 'Product updated successfully', 'product' => $updatedProduct]);
        } else {
            Response::error('Failed to update product', 500);
        }
    }

    private function deleteProduct($id) {
        if ($this->productModel->delete($id)) {
            Response::json(['message' => 'Product deleted successfully']);
        } else {
            Response::error('Failed to delete product', 500);
        }
    }

    private function getProductMovements($id) {
        $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 30;
        if ($limit <= 0) $limit = 30;
        $rows = $this->productModel->getStockMovements($id, $limit);
        Response::json($rows);
    }

    private function getVelocitySummary() {
        $days = isset($_GET['days']) ? intval($_GET['days']) : 30;
        if ($days <= 0) $days = 30;
        $rows = $this->productModel->getVelocitySummary($days);

        $mapped = array_map(function($row) use ($days) {
            $consumed = floatval($row['total_consumed'] ?? 0);
            $avgDaily = $days > 0 ? ($consumed / $days) : 0;
            $movementClass = 'Slow';
            if ($avgDaily >= 2) {
                $movementClass = 'Fast';
            } else if ($avgDaily >= 0.5) {
                $movementClass = 'Medium';
            }

            $row['avg_daily_usage'] = round($avgDaily, 4);
            $row['movement_class'] = $movementClass;
            return $row;
        }, $rows);

        Response::json($mapped);
    }

    private function getCostSummary() {
        $startDate = isset($_GET['start_date']) ? trim((string)$_GET['start_date']) : null;
        $endDate = isset($_GET['end_date']) ? trim((string)$_GET['end_date']) : null;
        $summary = $this->productModel->getCostSummary($startDate, $endDate);
        Response::json($summary);
    }

    private function restockProduct($id) {
        $data = $this->getBody();

        $quantity = floatval($data['quantity'] ?? 0);
        $amount = floatval($data['amount'] ?? 0);
        $notes = isset($data['notes']) ? trim((string)$data['notes']) : null;

        if ($quantity <= 0 || $amount <= 0) {
            Response::error('Restock quantity and amount must be greater than zero', 400);
        }

        $product = $this->productModel->getById($id);
        if (!$product) {
            Response::error('Product not found', 404);
        }

        $trackingMode = strtolower((string)($product['tracking_mode'] ?? 'units'));
        $previousQty = $this->getCurrentQuantity($product);
        $newQty = $previousQty + $quantity;
        $unitCost = $amount / $quantity;

        $initialQty = max(0, floatval($product['initial_quantity'] ?? 0));
        $initialCost = floatval($product['initial_cost'] ?? 0);
        $baseUnitCost = $initialQty > 0 ? ($initialCost / $initialQty) : 0;
        $priceDiffAmount = $unitCost - $baseUnitCost;
        $priceDiffPct = $baseUnitCost > 0 ? (($priceDiffAmount / $baseUnitCost) * 100) : 0;

        $remainingValue = floatval($product['remaining_value'] ?? 0) + $amount;
        $effectiveUnitCost = $newQty > 0 ? ($remainingValue / $newQty) : 0;

        $updatePayload = [
            'remaining_value' => round($remainingValue, 2),
            'cost_price' => round($effectiveUnitCost, 4),
            'status' => $this->resolveInventoryStatus(array_merge($product, [
                $trackingMode === 'level' ? 'quantity_remaining' : 'stock_quantity' => $newQty
            ]))
        ];
        if ($trackingMode === 'level') {
            $updatePayload['quantity_remaining'] = round($newQty, 2);
        } else {
            $updatePayload['stock_quantity'] = intval(round($newQty));
        }

        if (!$this->productModel->update($id, $updatePayload)) {
            Response::error('Failed to apply restock update', 500);
        }

        $this->productModel->addStockMovement([
            'product_id' => $id,
            'movement_type' => 'restock',
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'total_cost' => $amount,
            'previous_quantity' => $previousQty,
            'new_quantity' => $newQty,
            'price_vs_initial_amount' => $priceDiffAmount,
            'price_vs_initial_pct' => $priceDiffPct,
            'notes' => $notes
        ]);

        $updated = $this->productModel->getById($id);
        Response::json(['message' => 'Product restocked successfully', 'product' => $updated]);
    }

    private function consumeProduct($id) {
        $data = $this->getBody();

        $quantity = floatval($data['quantity'] ?? 0);
        $notes = isset($data['notes']) ? trim((string)$data['notes']) : null;
        if ($quantity <= 0) {
            Response::error('Consumed quantity must be greater than zero', 400);
        }

        $product = $this->productModel->getById($id);
        if (!$product) {
            Response::error('Product not found', 404);
        }

        $trackingMode = strtolower((string)($product['tracking_mode'] ?? 'units'));
        $previousQty = $this->getCurrentQuantity($product);
        if ($quantity > $previousQty) {
            Response::error('Consumed quantity exceeds available stock', 400);
        }

        $newQty = $previousQty - $quantity;
        $remainingValue = floatval($product['remaining_value'] ?? 0);
        $unitCost = $previousQty > 0 ? ($remainingValue / $previousQty) : 0;
        $consumedValue = $quantity * $unitCost;
        $newRemainingValue = max(0, $remainingValue - $consumedValue);

        $updatePayload = [
            'remaining_value' => round($newRemainingValue, 2),
            'cost_price' => $newQty > 0 ? round($newRemainingValue / $newQty, 4) : round($unitCost, 4),
            'status' => $this->resolveInventoryStatus(array_merge($product, [
                $trackingMode === 'level' ? 'quantity_remaining' : 'stock_quantity' => $newQty
            ]))
        ];
        if ($trackingMode === 'level') {
            $updatePayload['quantity_remaining'] = round($newQty, 2);
        } else {
            $updatePayload['stock_quantity'] = intval(round($newQty));
        }

        if (!$this->productModel->update($id, $updatePayload)) {
            Response::error('Failed to apply consumption update', 500);
        }

        $this->productModel->addStockMovement([
            'product_id' => $id,
            'movement_type' => 'consumption',
            'quantity' => $quantity,
            'unit_cost' => $unitCost,
            'total_cost' => $consumedValue,
            'previous_quantity' => $previousQty,
            'new_quantity' => $newQty,
            'price_vs_initial_amount' => 0,
            'price_vs_initial_pct' => 0,
            'notes' => $notes
        ]);

        $updated = $this->productModel->getById($id);
        Response::json(['message' => 'Product quantity updated successfully', 'product' => $updated]);
    }

    private function resolveInventoryStatus($data) {
        $trackingMode = strtolower((string)($data['tracking_mode'] ?? 'units'));
        $reorderLevel = isset($data['reorder_level']) ? floatval($data['reorder_level']) : 0;

        if ($trackingMode === 'level') {
            $remaining = isset($data['quantity_remaining']) ? floatval($data['quantity_remaining']) : 0;
            if ($remaining <= 0) return 'Out of Stock';
            if ($reorderLevel > 0 && $remaining <= $reorderLevel) return 'Low Stock';
            return 'In Stock';
        }

        $stock = isset($data['stock_quantity']) ? intval($data['stock_quantity']) : 0;
        if ($stock <= 0) return 'Out of Stock';
        if ($reorderLevel > 0 && $stock <= $reorderLevel) return 'Low Stock';
        if ($stock <= 10) return 'Low Stock';
        return 'In Stock';
    }

    private function getCurrentQuantity($data) {
        $trackingMode = strtolower((string)($data['tracking_mode'] ?? 'units'));
        if ($trackingMode === 'level') {
            return max(0, floatval($data['quantity_remaining'] ?? 0));
        }
        return max(0, floatval($data['stock_quantity'] ?? 0));
    }

    private function applyCostValuation($data) {
        $productType = strtolower((string)($data['product_type'] ?? 'saleable'));
        $initialQty = max(0, floatval($data['initial_quantity'] ?? 0));
        $currentQty = $this->getCurrentQuantity($data);
        $costPrice = floatval($data['cost_price'] ?? 0);
        $providedInitialCost = isset($data['initial_cost']) ? floatval($data['initial_cost']) : null;

        if ($productType === 'saleable') {
            $unitCost = $costPrice;
            $initialCost = $initialQty > 0 ? $unitCost * $initialQty : ($providedInitialCost ?? 0);
            $remainingValue = $unitCost * $currentQty;
        } else {
            $initialCost = $providedInitialCost !== null && $providedInitialCost > 0 ? $providedInitialCost : $costPrice;
            $unitCost = $initialQty > 0 ? ($initialCost / $initialQty) : 0;
            $remainingValue = $unitCost * $currentQty;
        }

        $data['initial_cost'] = round($initialCost, 2);
        $data['remaining_value'] = round($remainingValue, 2);
        return $data;
    }

}
