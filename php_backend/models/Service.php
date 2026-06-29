<?php
require_once __DIR__ . '/BaseModel.php';

class Service extends BaseModel {
    protected $table = 'services';

    public function getCategories() {
        $query = "SELECT id, name, status, display_order
                  FROM service_categories
                  WHERE status = 'Active'
                  ORDER BY COALESCE(display_order, 999), name";

        try {
            $result = $this->conn->query($query);
            if ($result) {
                return $result->fetch_all(MYSQLI_ASSOC);
            }
        } catch (\Throwable $e) {
            // Fall back when production schema does not include service_categories yet.
        }

        $fallbackQuery = "SELECT DISTINCT TRIM(category) AS name
                          FROM {$this->table}
                          WHERE category IS NOT NULL AND TRIM(category) <> ''
                          ORDER BY name";
        $fallbackResult = $this->conn->query($fallbackQuery);
        if (!$fallbackResult) {
            return [];
        }
        $rows = [];
        while ($row = $fallbackResult->fetch_assoc()) {
            $rows[] = [
                'id' => null,
                'name' => $row['name'],
                'status' => 'Active',
                'display_order' => null
            ];
        }
        return $rows;
    }

    public function createCategory($name, $status = 'Active', $displayOrder = null) {
        $name = trim((string) $name);
        if ($name === '') {
            return ['ok' => false, 'message' => 'Category name is required'];
        }

        $status = trim((string) $status) === 'Inactive' ? 'Inactive' : 'Active';
        $displayOrder = ($displayOrder === '' || $displayOrder === null) ? null : intval($displayOrder);

        try {
            $existing = $this->conn->prepare("SELECT id, name, status, display_order FROM service_categories WHERE LOWER(TRIM(name)) = LOWER(TRIM(?)) LIMIT 1");
            if (!$existing) {
                return ['ok' => false, 'message' => 'Unable to prepare category lookup'];
            }
            $existing->bind_param("s", $name);
            $existing->execute();
            $existingResult = $existing->get_result();
            $existingRow = $existingResult ? $existingResult->fetch_assoc() : null;
            if ($existingRow) {
                return ['ok' => true, 'id' => intval($existingRow['id']), 'existing' => true, 'row' => $existingRow];
            }

            if ($displayOrder === null) {
                $insert = $this->conn->prepare("INSERT INTO service_categories (name, status, display_order) VALUES (?, ?, NULL)");
                if (!$insert) {
                    return ['ok' => false, 'message' => 'Unable to prepare category insert'];
                }
                $insert->bind_param("ss", $name, $status);
            } else {
                $insert = $this->conn->prepare("INSERT INTO service_categories (name, status, display_order) VALUES (?, ?, ?)");
                if (!$insert) {
                    return ['ok' => false, 'message' => 'Unable to prepare category insert'];
                }
                $insert->bind_param("ssi", $name, $status, $displayOrder);
            }
            if (!$insert->execute()) {
                return ['ok' => false, 'message' => 'Failed to create category'];
            }

            return [
                'ok' => true,
                'id' => intval($insert->insert_id),
                'existing' => false,
                'row' => [
                    'id' => intval($insert->insert_id),
                    'name' => $name,
                    'status' => $status,
                    'display_order' => $displayOrder
                ]
            ];
        } catch (\Throwable $e) {
            return ['ok' => false, 'message' => 'service_categories table is missing or unavailable'];
        }
    }

    public function getAll() {
        $queryWithCategories = "SELECT s.*, sc.name AS category_name, cr.name AS commission_rule_name,
                  CASE WHEN cr.id IS NOT NULL
                    THEN ROUND(GREATEST(0, COALESCE(cr.commission_pool_rate, 0) - COALESCE(cr.tax_rate, 0)), 2)
                    ELSE NULL END AS commission_rule_staff_pct
                  FROM {$this->table} s
                  LEFT JOIN service_categories sc ON sc.id = s.category_id
                  LEFT JOIN commission_rules cr ON cr.id = s.commission_rule_id
                  ORDER BY COALESCE(sc.display_order, 999), s.name";

        try {
            $result = $this->conn->query($queryWithCategories);
            return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
        } catch (\Throwable $e) {
            // Production can lag behind migrations; fall back to legacy services schema.
            $fallbackQuery = "SELECT s.*, s.category AS category_name
                              FROM {$this->table} s
                              ORDER BY s.name";
            $fallbackResult = $this->conn->query($fallbackQuery);
            return $fallbackResult ? $fallbackResult->fetch_all(MYSQLI_ASSOC) : [];
        }
    }

    public function getById($id) {
        $queryWithCategories = "SELECT s.*, sc.name AS category_name, cr.name AS commission_rule_name,
                  CASE WHEN cr.id IS NOT NULL
                    THEN ROUND(GREATEST(0, COALESCE(cr.commission_pool_rate, 0) - COALESCE(cr.tax_rate, 0)), 2)
                    ELSE NULL END AS commission_rule_staff_pct
                  FROM {$this->table} s
                  LEFT JOIN service_categories sc ON sc.id = s.category_id
                  LEFT JOIN commission_rules cr ON cr.id = s.commission_rule_id
                  WHERE s.id = ?";

        try {
            $stmt = $this->conn->prepare($queryWithCategories);
            if (!$stmt) return null;
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            return $result ? $result->fetch_assoc() : null;
        } catch (\Throwable $e) {
            $fallbackQuery = "SELECT s.*, s.category AS category_name
                              FROM {$this->table} s
                              WHERE s.id = ?";
            $fallbackStmt = $this->conn->prepare($fallbackQuery);
            if (!$fallbackStmt) return null;
            $fallbackStmt->bind_param("i", $id);
            $fallbackStmt->execute();
            $fallbackResult = $fallbackStmt->get_result();
            return $fallbackResult ? $fallbackResult->fetch_assoc() : null;
        }
    }

    public function getLinkedProducts($serviceId) {
        $query = "SELECT sp.id, sp.product_id, sp.quantity, p.name AS product_name,
                         p.stock_quantity, p.quantity_remaining, p.tracking_mode, p.quantity_unit
                  FROM service_products sp
                  LEFT JOIN products p ON p.id = sp.product_id
                  WHERE sp.service_id = ?
                  ORDER BY p.name";
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return [];
        $stmt->bind_param("i", $serviceId);
        $stmt->execute();
        $result = $stmt->get_result();
        $products = [];
        if ($result) {
            while ($row = $result->fetch_assoc()) {
                $products[] = $row;
            }
        }
        $stmt->close();
        return $products;
    }

    public function setLinkedProducts($serviceId, $products) {
        $serviceId = intval($serviceId);
        if ($serviceId <= 0) return false;

        $deleteStmt = $this->conn->prepare("DELETE FROM service_products WHERE service_id = ?");
        if (!$deleteStmt) return false;
        $deleteStmt->bind_param("i", $serviceId);
        $deleteStmt->execute();
        $deleteStmt->close();

        if (empty($products)) return true;

        $insertStmt = $this->conn->prepare("INSERT INTO service_products (service_id, product_id, quantity) VALUES (?, ?, ?)");
        if (!$insertStmt) return false;

        foreach ($products as $p) {
            $productId = intval($p['product_id'] ?? 0);
            $quantity = floatval($p['quantity'] ?? 1);
            if ($productId <= 0) continue;
            $insertStmt->bind_param("iid", $serviceId, $productId, $quantity);
            if (!$insertStmt->execute()) {
                $insertStmt->close();
                return false;
            }
        }
        $insertStmt->close();
        return true;
    }

    private function resolveCategoryId($categoryId = null, $categoryName = null) {
        if (!empty($categoryId)) {
            return (int) $categoryId;
        }

        $categoryName = trim((string) ($categoryName ?? ''));
        if ($categoryName === '') {
            return null;
        }

        $select = $this->conn->prepare("SELECT id FROM service_categories WHERE name = ? LIMIT 1");
        if (!$select) return null;
        $select->bind_param("s", $categoryName);
        $select->execute();
        $result = $select->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        if ($row && isset($row['id'])) {
            return (int) $row['id'];
        }

        $insert = $this->conn->prepare("INSERT INTO service_categories (name, status) VALUES (?, 'Active')");
        if (!$insert) return null;
        $insert->bind_param("s", $categoryName);
        if ($insert->execute()) {
            return (int) $insert->insert_id;
        }
        return null;
    }

    public function create($data) {
        $query = "INSERT INTO {$this->table} (name, description, price, duration, category, category_id, image_url, status, commission_rule_id)
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULLIF(?, 0))";
                  
        $stmt = $this->conn->prepare($query);
        if (!$stmt) return false;

        $name = $data['name'] ?? '';
        $description = $data['description'] ?? '';
        $price = $data['price'] ?? 0;
        $duration = $data['duration'] ?? '';
        $category = trim((string)($data['category'] ?? ''));
        $categoryId = $this->resolveCategoryId($data['category_id'] ?? null, $category);
        $image_url = $data['image_url'] ?? '';
        $status = $data['status'] ?? 'Active';
        $commissionRuleId = 0;
        if (!empty($data['commission_rule_id'])) {
            $commissionRuleId = intval($data['commission_rule_id']);
        }

        // Types: name(s), description(s), price(d), duration(s), category(s), category_id(i), image_url(s), status(s), commission_rule_id(i)
        $stmt->bind_param("ssdssissi", $name, $description, $price, $duration, $category, $categoryId, $image_url, $status, $commissionRuleId);

        if ($stmt->execute()) {
            return $stmt->insert_id;
        }
        error_log('Service::create failed: ' . $stmt->error);
        return false;
    }

    public function update($id, $data) {
        $updates = [];
        $types = "";
        $params = [];
        
        $fields = [
            'name' => 's', 'description' => 's', 'price' => 'd', 'duration' => 's',
            'image_url' => 's', 'status' => 's'
        ];
        
        foreach ($fields as $field => $type) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $types .= $type;
                $params[] = $data[$field];
            }
        }

        if (isset($data['category']) || isset($data['category_id'])) {
            $categoryName = isset($data['category']) ? trim((string) $data['category']) : null;
            $categoryId = $this->resolveCategoryId($data['category_id'] ?? null, $categoryName);
            $updates[] = "category_id = ?";
            $types .= "i";
            $params[] = $categoryId;
            if ($categoryName !== null) {
                $updates[] = "category = ?";
                $types .= "s";
                $params[] = $categoryName;
            }
        }

        if (array_key_exists('commission_rule_id', $data)) {
            $rid = $data['commission_rule_id'];
            if ($rid === null || $rid === '' || $rid === false) {
                $updates[] = "commission_rule_id = NULL";
            } else {
                $updates[] = "commission_rule_id = ?";
                $types .= "i";
                $params[] = intval($rid);
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
}
