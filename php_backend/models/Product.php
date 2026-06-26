<?php
require_once __DIR__ . '/BaseModel.php';

class Product extends BaseModel {
    protected $table = 'products';

    public function getAll() {
        $query = "SELECT * FROM {$this->table} ORDER BY created_at DESC";
        $result = $this->conn->query($query);
        $data = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
        }
        return $data;
    }

    public function getById($id) {
        $query = "SELECT * FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return null;
        $stmt->bind_param("i", $id);
        $stmt->execute();
        $result = $stmt->get_result();
        return $result->fetch_assoc();
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} 
                  (name, sku, description, price, cost_price, initial_cost, remaining_value, stock_quantity, quantity_remaining, initial_quantity, quantity_unit, reorder_level, category, product_type, tracking_mode, status, image_url) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                  
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $name = $data['name'] ?? '';
        $sku = $data['sku'] ?? '';
        $description = $data['description'] ?? '';
        $price = isset($data['price']) ? floatval($data['price']) : 0;
        $costPrice = isset($data['cost_price']) ? floatval($data['cost_price']) : 0;
        $initialCost = isset($data['initial_cost']) ? floatval($data['initial_cost']) : 0;
        $remainingValue = isset($data['remaining_value']) ? floatval($data['remaining_value']) : 0;
        $stock = isset($data['stock_quantity']) ? intval($data['stock_quantity']) : 0;
        $quantityRemaining = isset($data['quantity_remaining']) && $data['quantity_remaining'] !== ''
            ? floatval($data['quantity_remaining'])
            : null;
        $initialQuantity = isset($data['initial_quantity']) && $data['initial_quantity'] !== ''
            ? floatval($data['initial_quantity'])
            : 0;
        $quantityUnit = $data['quantity_unit'] ?? 'units';
        $reorderLevel = isset($data['reorder_level']) ? floatval($data['reorder_level']) : 0;
        $category = $data['category'] ?? '';
        $productType = $data['product_type'] ?? 'Saleable';
        $trackingMode = $data['tracking_mode'] ?? 'Units';
        $status = $data['status'] ?? 'In Stock';
        $image = $data['image_url'] ?? '';

        $stmt->bind_param(
            "sssddddiddsdsssss",
            $name,
            $sku,
            $description,
            $price,
            $costPrice,
            $initialCost,
            $remainingValue,
            $stock,
            $quantityRemaining,
            $initialQuantity,
            $quantityUnit,
            $reorderLevel,
            $category,
            $productType,
            $trackingMode,
            $status,
            $image
        );
        
        if ($stmt->execute()) {
            return $stmt->insert_id;
        }
        return false;
    }

    public function update($id, $data) {
        $updates = [];
        $types = "";
        $params = [];
        
        $fields = [
            'name' => 's', 'sku' => 's', 'description' => 's',
            'price' => 'd', 'cost_price' => 'd', 'initial_cost' => 'd', 'remaining_value' => 'd', 'stock_quantity' => 'i',
            'quantity_remaining' => 'd', 'initial_quantity' => 'd', 'quantity_unit' => 's', 'reorder_level' => 'd',
            'category' => 's', 'product_type' => 's', 'tracking_mode' => 's',
            'status' => 's', 'image_url' => 's'
        ];
        
        foreach ($fields as $field => $type) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $types .= $type;
                $params[] = $data[$field];
            }
        }

        if (empty($updates)) return false;

        $query = "UPDATE {$this->table} SET " . implode(', ', $updates) . " WHERE id = ?";
        $types .= "i";
        $params[] = $id;

        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        
        $stmt->bind_param($types, ...$params);
        return $stmt->execute();
    }

    public function delete($id) {
        $query = "DELETE FROM {$this->table} WHERE id = ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;
        $stmt->bind_param("i", $id);
        return $stmt->execute();
    }

    public function addStockMovement($data) {
        $query = "INSERT INTO product_stock_movements 
                  (product_id, movement_type, quantity, unit_cost, total_cost, previous_quantity, new_quantity, price_vs_initial_amount, price_vs_initial_pct, notes)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $productId = intval($data['product_id'] ?? 0);
        $movementType = $data['movement_type'] ?? 'adjustment';
        $quantity = floatval($data['quantity'] ?? 0);
        $unitCost = floatval($data['unit_cost'] ?? 0);
        $totalCost = floatval($data['total_cost'] ?? 0);
        $previousQuantity = floatval($data['previous_quantity'] ?? 0);
        $newQuantity = floatval($data['new_quantity'] ?? 0);
        $priceVsInitialAmount = floatval($data['price_vs_initial_amount'] ?? 0);
        $priceVsInitialPct = floatval($data['price_vs_initial_pct'] ?? 0);
        $notes = $data['notes'] ?? null;

        $stmt->bind_param(
            "isddddddds",
            $productId,
            $movementType,
            $quantity,
            $unitCost,
            $totalCost,
            $previousQuantity,
            $newQuantity,
            $priceVsInitialAmount,
            $priceVsInitialPct,
            $notes
        );

        return $stmt->execute();
    }

    public function getStockMovements($productId, $limit = 30) {
        $query = "SELECT id, product_id, movement_type, quantity, unit_cost, total_cost, previous_quantity, new_quantity, price_vs_initial_amount, price_vs_initial_pct, notes, created_at
                  FROM product_stock_movements
                  WHERE product_id = ?
                  ORDER BY created_at DESC
                  LIMIT ?";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $stmt->bind_param("ii", $productId, $limit);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getVelocitySummary($days = 30) {
        $query = "SELECT 
                    p.id,
                    p.name,
                    p.product_type,
                    p.tracking_mode,
                    COALESCE(c.total_consumed, 0) AS total_consumed,
                    COALESCE(r.total_restocked, 0) AS total_restocked,
                    COALESCE(r.last_restock_at, NULL) AS last_restock_at
                  FROM products p
                  LEFT JOIN (
                    SELECT product_id, SUM(quantity) AS total_consumed
                    FROM product_stock_movements
                    WHERE movement_type = 'consumption'
                      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                    GROUP BY product_id
                  ) c ON c.product_id = p.id
                  LEFT JOIN (
                    SELECT product_id, SUM(quantity) AS total_restocked, MAX(created_at) AS last_restock_at
                    FROM product_stock_movements
                    WHERE movement_type = 'restock'
                      AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
                    GROUP BY product_id
                  ) r ON r.product_id = p.id
                  ORDER BY p.name ASC";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $stmt->bind_param("ii", $days, $days);
        $stmt->execute();
        $result = $stmt->get_result();
        $rows = [];
        while ($row = $result->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    public function getCostSummary($startDate = null, $endDate = null) {
        $query = "SELECT
                    SUM(CASE WHEN movement_type = 'consumption' THEN total_cost ELSE 0 END) AS total_consumption_cost,
                    SUM(CASE WHEN movement_type = 'restock' THEN total_cost ELSE 0 END) AS total_restock_cost
                  FROM product_stock_movements
                  WHERE 1=1";

        $types = "";
        $params = [];
        if ($startDate) {
            $query .= " AND DATE(created_at) >= ?";
            $types .= "s";
            $params[] = $startDate;
        }
        if ($endDate) {
            $query .= " AND DATE(created_at) <= ?";
            $types .= "s";
            $params[] = $endDate;
        }

        $stmt = $this->conn->prepare($query);
        if (!$stmt) {
            return ['total_consumption_cost' => 0, 'total_restock_cost' => 0];
        }
        if ($types !== "") {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        return $row ?: ['total_consumption_cost' => 0, 'total_restock_cost' => 0];
    }
}
