import React, { useState, useContext, useEffect } from 'react';
import { 
  FiPlus, FiBox, FiSearch, FiMoreHorizontal, 
  FiEdit, FiTrash2, FiTag, FiDollarSign, 
  FiChevronDown, FiCheckCircle, FiX, FiAlertTriangle, FiShoppingBag
} from 'react-icons/fi';
import AdminLayout, { AdminThemeContext } from './AdminLayout';
import AdminModal from '../../components/admin/AdminModal';
import SuccessModal from '../../components/admin/SuccessModal';
import ConfirmModal from '../../components/admin/ConfirmModal';
import FeedbackModal from '../../components/admin/FeedbackModal';
import AdminTable from '../../components/admin/AdminTable';
import { productApi } from '../../api/products';
import { canAddOrEditProducts, canDeleteProducts, getCurrentAdminRole, isAttendant } from '../../adminAccess';

const ProductsManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const currentRole = getCurrentAdminRole();
  const canMutateProducts = canAddOrEditProducts(currentRole);
  const canRemoveProduct = canDeleteProducts(currentRole);
  const attendantReadOnly = isAttendant(currentRole);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Saleable' | 'Internal Use'>('All');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [viewingProduct, setViewingProduct] = useState<any>(null);
  const [viewMovements, setViewMovements] = useState<any[]>([]);
  const [velocityMap, setVelocityMap] = useState<Record<number, any>>({});
  const [restockProduct, setRestockProduct] = useState<any>(null);
  const [restockQuantity, setRestockQuantity] = useState<string>('');
  const [restockAmount, setRestockAmount] = useState<string>('');
  const [restockNotes, setRestockNotes] = useState<string>('');
  const [levelProduct, setLevelProduct] = useState<any>(null);
  const [removeQuantityInput, setRemoveQuantityInput] = useState<string>('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackTitle, setFeedbackTitle] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    sku: '',
    product_type: 'Saleable',
    tracking_mode: 'Units',
    stock_quantity: 0,
    quantity_remaining: '',
    initial_quantity: '',
    quantity_unit: 'units',
    reorder_level: 0,
    price: '',
    cost_price: '',
    description: '',
    status: 'In Stock',
  });

  const fetchData = async () => {
    try {
      const [res, velocityRes] = await Promise.all([
        productApi.getAll(),
        productApi.getVelocitySummary(30)
      ]);
      const statusClasses: Record<string, string> = {
        'In Stock': 'text-success',
        'Low Stock': 'text-warning',
        'Out of Stock': 'text-danger'
      };
      
      const data = (res.data?.data || res.data || []).map((p: any) => ({
        ...p,
        product_type: p.product_type || 'Saleable',
        tracking_mode: p.tracking_mode || 'Units',
        initial_quantity: Number(p.initial_quantity || 0),
        quantity_unit: p.quantity_unit || 'units',
        reorder_level: Number(p.reorder_level || 0),
        cost_price: p.cost_price ?? 0,
        initial_cost: Number(p.initial_cost || 0),
        remaining_value: Number(p.remaining_value || 0),
        statusClass: statusClasses[p.status] || 'text-secondary'
      }));
      setProducts(data);

      const velocityRows = velocityRes.data?.data || velocityRes.data || [];
      const nextVelocityMap: Record<number, any> = {};
      (Array.isArray(velocityRows) ? velocityRows : []).forEach((row: any) => {
        nextVelocityMap[Number(row.id)] = row;
      });
      setVelocityMap(nextVelocityMap);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProduct) {
        await productApi.update(editingProduct.id, formData);
      } else {
        await productApi.create(formData);
      }
      setLoading(false);
      setIsModalOpen(false);
      
      // Show success modal
      setSuccessMessage(editingProduct ? "Product details have been updated." : "New product has been added to inventory.");
      setIsSuccessModalOpen(true);
      
      setEditingProduct(null);
      setFormData({
        name: '',
        category: '',
        sku: '',
        product_type: 'Saleable',
        tracking_mode: 'Units',
        stock_quantity: 0,
        quantity_remaining: '',
        initial_quantity: '',
        quantity_unit: 'units',
        reorder_level: 0,
        price: '',
        cost_price: '',
        description: '',
        status: 'In Stock'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving product:', error);
      setLoading(false);
      setFeedbackTitle('Save Failed');
      setFeedbackMessage(error instanceof Error ? error.message : 'Failed to save product. Please try again.');
      setIsFeedbackModalOpen(true);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      sku: product.sku,
      product_type: product.product_type || 'Saleable',
      tracking_mode: product.tracking_mode || 'Units',
      stock_quantity: product.stock_quantity,
      quantity_remaining: product.quantity_remaining ?? '',
      initial_quantity: product.initial_quantity ?? '',
      quantity_unit: product.quantity_unit || 'units',
      reorder_level: Number(product.reorder_level || 0),
      price: product.price,
      cost_price: product.cost_price ?? '',
      description: product.description,
      status: product.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    setProductToDelete(id);
    setIsConfirmModalOpen(true);
  };

  const handleView = async (product: any) => {
    setViewingProduct(product);
    setIsViewModalOpen(true);
    try {
      const res = await productApi.getMovements(product.id, 20);
      const rows = res.data?.data || res.data || [];
      setViewMovements(Array.isArray(rows) ? rows : []);
    } catch (error) {
      console.error('Error fetching product movements:', error);
      setViewMovements([]);
    }
  };

  const openRestockModal = (product: any) => {
    setRestockProduct(product);
    setRestockQuantity('');
    setRestockAmount('');
    setRestockNotes('');
    setIsRestockModalOpen(true);
  };

  const openLevelModal = (product: any) => {
    setLevelProduct(product);
    setRemoveQuantityInput('');
    setIsLevelModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await productApi.delete(productToDelete);
      await fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      setFeedbackTitle('Delete Failed');
      setFeedbackMessage(error instanceof Error ? error.message : 'Failed to delete product.');
      setIsFeedbackModalOpen(true);
    } finally {
      setIsConfirmModalOpen(false);
      setProductToDelete(null);
    }
  };

  const handleUpdateLevel = async () => {
    if (!levelProduct) return;
    const removed = Number(removeQuantityInput);
    if (!Number.isFinite(removed) || removed <= 0) return;

    const current = levelProduct.tracking_mode === 'Level'
      ? Number(levelProduct.quantity_remaining || 0)
      : Number(levelProduct.stock_quantity || 0);
    if (removed > current) return;

    setLoading(true);
    try {
      await productApi.consume(levelProduct.id, { quantity: removed, notes: 'Inventory usage deduction' });
      setSuccessMessage('Product remaining level updated successfully.');
      setIsSuccessModalOpen(true);
      setIsLevelModalOpen(false);
      setLevelProduct(null);
      setRemoveQuantityInput('');
      fetchData();
    } catch (error) {
      console.error('Error updating remaining level:', error);
      setFeedbackTitle('Update Failed');
      setFeedbackMessage('Failed to update product level. Please try again.');
      setIsFeedbackModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRestock = async () => {
    if (!restockProduct) return;
    const quantity = Number(restockQuantity);
    const amount = Number(restockAmount);
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    if (!Number.isFinite(amount) || amount <= 0) return;

    setLoading(true);
    try {
      await productApi.restock(restockProduct.id, {
        quantity,
        amount,
        notes: restockNotes || undefined,
      });
      setSuccessMessage('Product restocked successfully.');
      setIsSuccessModalOpen(true);
      setIsRestockModalOpen(false);
      setRestockProduct(null);
      setRestockQuantity('');
      setRestockAmount('');
      setRestockNotes('');
      fetchData();
    } catch (error) {
      console.error('Error restocking product:', error);
      setFeedbackTitle('Restock Failed');
      setFeedbackMessage(error instanceof Error ? error.message : 'Failed to restock product.');
      setIsFeedbackModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'In Stock': return <FiCheckCircle className="me-1" />;
      case 'Low Stock': return <FiAlertTriangle className="me-1" />;
      case 'Out of Stock': return <FiX className="me-1" />;
      default: return null;
    }
  };

  const toggleStatus = async (id: number, newStatus: string) => {
    try {
      await productApi.updateStatus(id, newStatus);
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      setFeedbackTitle('Status Update Failed');
      setFeedbackMessage(error instanceof Error ? error.message : 'Failed to update product status.');
      setIsFeedbackModalOpen(true);
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' ? true : p.product_type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <AdminLayout>
      <div className="container-fluid">
        {/* Header Section */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3">
          <div>
            <h1 className="brand-title text-gradient h2 mb-2">Inventory Management</h1>
            <p className="text-secondary mb-0 small tracking-widest text-uppercase">Track stock levels and retail products</p>
          </div>
          {canMutateProducts && (
            <button 
              onClick={() => {
                setEditingProduct(null);
                setFormData({
                  name: '',
                  category: '',
                  sku: '',
                  product_type: 'Saleable',
                  tracking_mode: 'Units',
                  stock_quantity: 0,
                  quantity_remaining: '',
                  initial_quantity: '',
                  quantity_unit: 'units',
                  reorder_level: 0,
                  price: '',
                  cost_price: '',
                  description: '',
                  status: 'In Stock'
                });
                setIsModalOpen(true);
              }}
              className="btn btn-purple rounded-pill px-4 py-3 fw-bold d-flex align-items-center justify-content-center shadow-lg transition-all hover-scale"
            >
              <FiPlus className="me-2" /> ADD NEW PRODUCT
            </button>
          )}
        </div>

        {/* Inventory Overview Cards */}
        <div className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center">
              <div className="p-3 rounded-circle bg-purple bg-opacity-10 text-purple me-3">
                <FiBox size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>Total Items</div>
                <div className="h4 mb-0 fw-bold">{products.length}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center border-warning border-opacity-25">
              <div className="p-3 rounded-circle bg-warning bg-opacity-10 text-warning me-3">
                <FiAlertTriangle size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>Low Stock</div>
                <div className="h4 mb-0 fw-bold text-warning">{products.filter(p => p.status === 'Low Stock').length}</div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="glass-panel p-3 rounded-4 border-1 shadow-sm d-flex align-items-center">
              <div className="p-3 rounded-circle bg-success bg-opacity-10 text-success me-3">
                <FiShoppingBag size={20} />
              </div>
              <div>
                <div className="text-secondary small text-uppercase tracking-wider fw-bold" style={{ fontSize: '0.65rem' }}>{attendantReadOnly ? 'Stock Visibility' : 'Stock Value'}</div>
                <div className="h4 mb-0 fw-bold">
                  {attendantReadOnly ? 'Restricted' : `KES ${products.reduce((acc, p) => acc + Number(p.remaining_value || 0), 0).toLocaleString()}`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="glass-panel p-3 rounded-4 mb-4 border-1 shadow-sm">
          <div className="row g-3">
            <div className="col-md-6 col-lg-4">
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input 
                  type="text" 
                  className="form-control glass-input-simple ps-5" 
                  placeholder="Search products by name or SKU..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-3 col-lg-3">
              <select
                className="form-select glass-input-simple"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as 'All' | 'Saleable' | 'Internal Use')}
              >
                <option value="All">All Products</option>
                <option value="Saleable">Saleable Only</option>
                <option value="Internal Use">Internal Use Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <AdminTable 
          isDarkMode={isDarkMode}
          data={filteredProducts}
          columns={[
            { header: 'Product Details' },
            { header: 'Type' },
            { header: 'Stock Level' },
            ...(!attendantReadOnly ? [{ header: 'Remaining Value (KES)' }] : []),
            { header: 'Inventory Status', align: 'center' },
            ...(!attendantReadOnly ? [{ header: 'Action', align: 'end' as const }] : [])
          ]}
          renderRow={(product) => (
            <tr key={product.id} className="align-middle border-bottom border-opacity-10">
              <td className="px-4 py-4 border-0">
                <div className="d-flex align-items-center">
                  <div className="bg-purple bg-opacity-10 rounded-3 p-2 text-purple me-3 d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                    <FiShoppingBag size={18} />
                  </div>
                  <div>
                    <div className="fw-bold">{product.name}</div>
                    <div className="text-secondary x-small tracking-wider">{product.sku}</div>
                    {velocityMap[product.id]?.movement_class && (
                      <div className={`x-small mt-1 ${
                        velocityMap[product.id].movement_class === 'Fast'
                          ? 'text-danger'
                          : velocityMap[product.id].movement_class === 'Medium'
                            ? 'text-warning'
                            : 'text-info'
                      }`}>
                        {velocityMap[product.id].movement_class} moving
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="py-4 border-0 small">
                <span className={`badge rounded-pill ${product.product_type === 'Saleable' ? 'bg-success bg-opacity-10 text-success' : 'bg-info bg-opacity-10 text-info'}`}>
                  {product.product_type}
                </span>
              </td>
              <td className="py-4 border-0">
                <div className="fw-bold">
                  {product.tracking_mode === 'Level'
                    ? `${Number(product.quantity_remaining || 0)} ${product.quantity_unit || 'units'}`
                    : `${Number(product.stock_quantity || 0)} units`}
                </div>
                <div className="text-secondary x-small">
                  {product.tracking_mode === 'Level' ? 'Depreciating stock' : 'Unit count stock'}
                </div>
                <div className="progress mt-1" style={{ height: '4px', width: '60px' }}>
                  <div 
                    className={`progress-bar ${
                      (product.tracking_mode === 'Level' ? Number(product.quantity_remaining || 0) : Number(product.stock_quantity || 0)) > Number(product.reorder_level || 0)
                        ? 'bg-success'
                        : (product.tracking_mode === 'Level' ? Number(product.quantity_remaining || 0) : Number(product.stock_quantity || 0)) > 0
                          ? 'bg-warning'
                          : 'bg-danger'
                    }`} 
                    style={{
                      width: `${Math.min(
                        (product.tracking_mode === 'Level'
                          ? Number(product.quantity_remaining || 0)
                          : Number(product.stock_quantity || 0)) * 2,
                        100
                      )}%`
                    }}
                  ></div>
                </div>
              </td>
              {!attendantReadOnly && (
                <td className="py-4 border-0 fw-bold">{Number(product.remaining_value || 0).toLocaleString()}</td>
              )}
              <td className="py-4 border-0 text-center">
                {canMutateProducts ? (
                <div className="dropdown">
                  <button 
                    className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 cursor-pointer border-0 transition-all hover-scale-sm dropdown-toggle hide-caret ${product.statusClass.replace('text-', 'bg-')}`}
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    type="button"
                  >
                    <span className={`${product.statusClass} d-flex align-items-center`}>
                      {getStatusIcon(product.status)}
                      {product.status}
                      <FiChevronDown className="ms-1 opacity-50" size={12} />
                    </span>
                  </button>
                  <ul className={`dropdown-menu shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                    <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Quick Stock Update</h6></li>
                    {['In Stock', 'Low Stock', 'Out of Stock'].map(status => (
                      <li key={status}>
                        <button 
                          className="dropdown-item d-flex align-items-center py-2" 
                          onClick={() => toggleStatus(product.id, status)}
                        >
                          <span className={`me-2 ${status === 'In Stock' ? 'text-success' : status === 'Low Stock' ? 'text-warning' : 'text-danger'}`}>
                            {getStatusIcon(status)}
                          </span>
                          {status}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
                ) : (
                  <span className={`badge rounded-pill bg-opacity-10 d-inline-flex align-items-center px-3 py-2 border-0 ${product.statusClass.replace('text-', 'bg-')}`}>
                    <span className={`${product.statusClass} d-flex align-items-center`}>
                      {getStatusIcon(product.status)}
                      {product.status}
                    </span>
                  </span>
                )}
              </td>
              {!attendantReadOnly && (
              <td className="px-4 py-4 border-0 text-end">
                  <div className="dropdown">
                    <button 
                      className={`btn btn-sm p-2 rounded-circle border-0 ${isDarkMode ? 'text-white hover-bg-white-10' : 'text-dark hover-bg-black-10'}`}
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <FiMoreHorizontal size={18} />
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? 'dropdown-menu-dark' : ''}`}>
                      <li><h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">Manage Product</h6></li>
                      <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => handleView(product)}><FiSearch className="me-2" /> View Product</button></li>
                      {canMutateProducts && <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => handleEdit(product)}><FiEdit className="me-2" /> Edit Details</button></li>}
                      {canMutateProducts && <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openRestockModal(product)}><FiPlus className="me-2" /> Restock</button></li>}
                      {canMutateProducts && product.tracking_mode === 'Level' && (
                        <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openLevelModal(product)}><FiBox className="me-2" /> Update Level</button></li>
                      )}
                      {canMutateProducts && product.tracking_mode === 'Units' && product.product_type !== 'Saleable' && (
                        <li><button className="dropdown-item d-flex align-items-center py-2" type="button" onClick={() => openLevelModal(product)}><FiBox className="me-2" /> Remove Units</button></li>
                      )}
                      {canRemoveProduct && <li><hr className="dropdown-divider opacity-10" /></li>}
                      {canRemoveProduct && <li><button className="dropdown-item d-flex align-items-center py-2 text-danger" type="button" onClick={() => handleDelete(product.id)}><FiTrash2 className="me-2" /> Remove Product</button></li>}
                    </ul>
                  </div>
              </td>
              )}
            </tr>
          )}
        />
      </div>

      {/* Add/Edit Product Modal */}
      <AdminModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? "Edit Product" : "Register New Product"}
        subtitle="Catalog replenishment and retail setup"
        isDarkMode={isDarkMode}
      >
        <form onSubmit={handleSubmit}>
          <div className="row g-4 mb-5">
            {/* Left Column */}
            <div className="col-lg-4 border-end border-opacity-10 pe-lg-4">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 01</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Product Identification</h4>
              </div>
              
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Product Name</label>
                <div className="position-relative">
                  <FiTag className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                  <input type="text" name="name" className="form-control glass-input-premium ps-5" placeholder="e.g. Argan Treatment Oil" required value={formData.name} onChange={handleChange} />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Internal SKU</label>
                <input type="text" name="sku" className="form-control glass-input-premium" placeholder="KRH-XXX" required value={formData.sku} onChange={handleChange} />
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Category</label>
                <select name="category" className="form-select glass-input-premium" required value={formData.category} onChange={handleChange}>
                  <option value="">Select</option>
                  <option value="Hair Care">Hair Care</option>
                  <option value="Skin Care">Skin Care</option>
                  <option value="Men's Grooming">Men's Grooming</option>
                  <option value="Body Care">Body Care</option>
                  <option value="Wellness">Wellness</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Product Type</label>
                <select name="product_type" className="form-select glass-input-premium" required value={formData.product_type} onChange={handleChange}>
                  <option value="Saleable">Saleable</option>
                  <option value="Internal Use">Internal Use</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Tracking Mode</label>
                <select name="tracking_mode" className="form-select glass-input-premium" required value={formData.tracking_mode} onChange={handleChange}>
                  <option value="Units">Units (counted items)</option>
                  <option value="Level">Level (depreciating use)</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="col-lg-8 ps-lg-4">
              <div className="section-title mb-4">
                <span className="badge-premium mb-2">PART 02</span>
                <h4 className="h6 fw-bold text-uppercase tracking-wider">Inventory & Pricing</h4>
              </div>

              <div className="row g-4">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
                    {formData.tracking_mode === 'Level' ? 'Quantity Remaining' : 'Stock Quantity'}
                  </label>
                  <div className="position-relative">
                    <FiBox className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    {formData.tracking_mode === 'Level' ? (
                      <input type="number" step="0.01" name="quantity_remaining" className="form-control glass-input-premium ps-5" placeholder="0" required value={formData.quantity_remaining} onChange={handleChange} />
                    ) : (
                      <input type="number" name="stock_quantity" className="form-control glass-input-premium ps-5" placeholder="0" required value={formData.stock_quantity} onChange={handleChange} />
                    )}
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Initial Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    name="initial_quantity"
                    className="form-control glass-input-premium"
                    placeholder="Defaults to the starting quantity"
                    value={formData.initial_quantity}
                    onChange={handleChange}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
                    {formData.product_type === 'Saleable' ? 'Cost Per Unit (KES)' : 'General Cost (KES)'}
                  </label>
                  <div className="position-relative">
                    <FiDollarSign className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                    <input
                      type="number"
                      name="cost_price"
                      className="form-control glass-input-premium ps-5"
                      placeholder={formData.product_type === 'Saleable' ? 'e.g. 250 per item' : 'e.g. 1500 total cost'}
                      required
                      value={formData.cost_price}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="x-small text-secondary mt-1">
                    {formData.product_type === 'Saleable'
                      ? 'Used as per-unit cost for margin and stock valuation.'
                      : 'Used as total/general inventory cost for this internal item.'}
                  </div>
                </div>
                {formData.product_type === 'Saleable' && (
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Sale Price (KES)</label>
                    <div className="position-relative">
                      <FiDollarSign className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary opacity-50" />
                      <input type="number" name="price" className="form-control glass-input-premium ps-5" placeholder="0.00" required value={formData.price} onChange={handleChange} />
                    </div>
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Reorder Level</label>
                  <input type="number" step="0.01" name="reorder_level" className="form-control glass-input-premium" placeholder="0" value={formData.reorder_level} onChange={handleChange} />
                </div>
                {formData.tracking_mode === 'Level' && (
                  <div className="col-md-6">
                    <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Quantity Unit</label>
                    <input type="text" name="quantity_unit" className="form-control glass-input-premium" placeholder="e.g. ml, litres, grams" value={formData.quantity_unit} onChange={handleChange} />
                  </div>
                )}
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Initial Status</label>
                  <select name="status" className="form-select glass-input-premium" value={formData.status} onChange={handleChange}>
                    <option value="In Stock">In Stock</option>
                    <option value="Low Stock">Low Stock</option>
                    <option value="Out of Stock">Out of Stock</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Product Description</label>
                <textarea name="description" className="form-control glass-input-premium pt-3" placeholder="Additional product details..." rows={3} value={formData.description} onChange={handleChange}></textarea>
              </div>
            </div>
          </div>

          <div className="border-top border-opacity-10 pt-4 d-flex justify-content-end align-items-center">
            <button 
              type="button" 
              className="btn px-4 py-2 rounded-pill fw-bold text-secondary hover-bg-light me-3 transition-all"
              onClick={() => setIsModalOpen(false)}
            >
              CANCEL
            </button>
            <button 
              type="submit" 
              className="btn btn-purple px-5 py-2 rounded-pill fw-bold shadow-lg transition-all hover-scale" 
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" /> PROCESSING...</>
              ) : editingProduct ? 'UPDATE PRODUCT' : 'CONFIRM ADDITION'}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* Success Feedback Modal */}
      <SuccessModal 
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        message={successMessage}
        isDarkMode={isDarkMode}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => { setIsConfirmModalOpen(false); setProductToDelete(null); }}
        onConfirm={handleConfirmDelete}
        title="Remove Product"
        message="Are you sure you want to remove this product?"
        confirmText="Remove"
        isDarkMode={isDarkMode}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title={feedbackTitle}
        message={feedbackMessage}
        variant="error"
        isDarkMode={isDarkMode}
      />

      <AdminModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setViewingProduct(null);
          setViewMovements([]);
        }}
        title="Product Details"
        subtitle="Full inventory and pricing profile"
        isDarkMode={isDarkMode}
        maxWidth="680px"
      >
        {viewingProduct && (
          <div className="row g-3">
            <div className="col-md-6"><strong>Name:</strong> {viewingProduct.name}</div>
            <div className="col-md-6"><strong>SKU:</strong> {viewingProduct.sku}</div>
            <div className="col-md-6"><strong>Type:</strong> {viewingProduct.product_type}</div>
            <div className="col-md-6"><strong>Category:</strong> {viewingProduct.category || 'N/A'}</div>
            <div className="col-md-6"><strong>Tracking Mode:</strong> {viewingProduct.tracking_mode}</div>
            <div className="col-md-6"><strong>Status:</strong> {viewingProduct.status}</div>
            <div className="col-md-6">
              <strong>Current Quantity:</strong>{' '}
              {viewingProduct.tracking_mode === 'Level'
                ? `${Number(viewingProduct.quantity_remaining || 0)} ${viewingProduct.quantity_unit || 'units'}`
                : `${Number(viewingProduct.stock_quantity || 0)} units`}
            </div>
            <div className="col-md-6"><strong>Initial Quantity:</strong> {Number(viewingProduct.initial_quantity || 0)}</div>
            <div className="col-md-6"><strong>Sale Price (KES):</strong> {viewingProduct.product_type === 'Saleable' ? Number(viewingProduct.price || 0).toLocaleString() : '-'}</div>
            <div className="col-md-6"><strong>Cost Price (KES):</strong> {Number(viewingProduct.cost_price || 0).toLocaleString()}</div>
            <div className="col-md-6"><strong>Initial Cost (KES):</strong> {Number(viewingProduct.initial_cost || 0).toLocaleString()}</div>
            <div className="col-md-6"><strong>Remaining Value (KES):</strong> {Number(viewingProduct.remaining_value || 0).toLocaleString()}</div>
            <div className="col-md-6"><strong>Reorder Level:</strong> {Number(viewingProduct.reorder_level || 0)}</div>
            <div className="col-md-6"><strong>Movement Speed:</strong> {velocityMap[viewingProduct.id]?.movement_class || 'N/A'}</div>
            <div className="col-12"><strong>Description:</strong> {viewingProduct.description || 'N/A'}</div>
            <div className="col-12 mt-3">
              <strong>Recent Restocks / Consumption</strong>
              <div className="table-responsive mt-2">
                <table className="table table-sm align-middle mb-0">
                  <thead>
                    <tr>
                      <th>When</th>
                      <th>Type</th>
                      <th>Qty</th>
                      <th>Amount</th>
                      <th>Price Diff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewMovements.length === 0 ? (
                      <tr><td colSpan={5} className="text-secondary small">No stock movement history yet.</td></tr>
                    ) : viewMovements.map((m) => (
                      <tr key={m.id}>
                        <td className="small">{m.created_at}</td>
                        <td className="small text-capitalize">{m.movement_type}</td>
                        <td className="small">{Number(m.quantity || 0)}</td>
                        <td className="small">KES {Number(m.total_cost || 0).toLocaleString()}</td>
                        <td className={`small ${Number(m.price_vs_initial_amount || 0) > 0 ? 'text-danger' : Number(m.price_vs_initial_amount || 0) < 0 ? 'text-success' : 'text-secondary'}`}>
                          {Number(m.price_vs_initial_amount || 0) === 0
                            ? '-'
                            : `${Number(m.price_vs_initial_amount || 0) > 0 ? '+' : ''}${Number(m.price_vs_initial_amount || 0).toFixed(2)} (${Number(m.price_vs_initial_pct || 0).toFixed(2)}%)`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={isRestockModalOpen}
        onClose={() => {
          setIsRestockModalOpen(false);
          setRestockProduct(null);
          setRestockQuantity('');
          setRestockAmount('');
          setRestockNotes('');
        }}
        title="Restock Product"
        subtitle="Add stock and track restock cost variance"
        isDarkMode={isDarkMode}
        maxWidth="560px"
      >
        <div className="mb-3">
          <div className="small text-secondary mb-1">Product</div>
          <div className="fw-bold">{restockProduct?.name || '-'}</div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Restock Quantity</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control glass-input-premium"
              value={restockQuantity}
              onChange={(e) => setRestockQuantity(e.target.value)}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Restock Amount (KES)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              className="form-control glass-input-premium"
              value={restockAmount}
              onChange={(e) => setRestockAmount(e.target.value)}
            />
          </div>
          <div className="col-12">
            <div className="small text-secondary">
              Restock unit price: {Number(restockQuantity) > 0 ? `KES ${(Number(restockAmount || 0) / Number(restockQuantity)).toFixed(2)}` : '-'}
            </div>
          </div>
          <div className="col-12">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Notes (Optional)</label>
            <textarea
              rows={2}
              className="form-control glass-input-premium"
              value={restockNotes}
              onChange={(e) => setRestockNotes(e.target.value)}
              placeholder="Supplier, batch, reason for price change..."
            />
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-4">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setIsRestockModalOpen(false);
              setRestockProduct(null);
              setRestockQuantity('');
              setRestockAmount('');
              setRestockNotes('');
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-purple"
            onClick={handleRestock}
            disabled={loading || !restockQuantity || !restockAmount}
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Apply Restock'}
          </button>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={isLevelModalOpen}
        onClose={() => {
          setIsLevelModalOpen(false);
          setLevelProduct(null);
          setRemoveQuantityInput('');
        }}
        title="Remove Quantity From Stock"
        subtitle="Update by consumed/removed amount"
        isDarkMode={isDarkMode}
        maxWidth="520px"
      >
        <div className="mb-4">
          <div className="small text-secondary mb-1">Product</div>
          <div className="fw-bold">{levelProduct?.name || '-'}</div>
        </div>
        <div className="mb-4">
          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">Quantity Removed ({levelProduct?.quantity_unit || 'units'})</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className="form-control glass-input-premium"
            value={removeQuantityInput}
            onChange={(e) => setRemoveQuantityInput(e.target.value)}
          />
          <div className="small text-secondary mt-2">
            Current quantity: {levelProduct?.tracking_mode === 'Level'
              ? Number(levelProduct?.quantity_remaining || 0)
              : Number(levelProduct?.stock_quantity || 0)} {levelProduct?.quantity_unit || 'units'}
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              setIsLevelModalOpen(false);
              setLevelProduct(null);
              setRemoveQuantityInput('');
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-purple"
            onClick={handleUpdateLevel}
            disabled={loading || !removeQuantityInput}
          >
            {loading ? <span className="spinner-border spinner-border-sm" /> : 'Apply Deduction'}
          </button>
        </div>
      </AdminModal>

      <style dangerouslySetInnerHTML={{ __html: `
        .glass-input-simple {
          background: rgba(106, 13, 173, 0.03) !important;
          border: 1px solid rgba(106, 13, 173, 0.1) !important;
          padding: 0.75rem 1rem !important;
          border-radius: 12px !important;
        }
        .btn-purple { background: var(--purple); color: white; border: none; }
        .glass-input-premium {
          background: transparent !important;
          border: 1px solid rgba(106, 13, 173, 0.15) !important;
          padding: 0.9rem 1rem !important;
          border-radius: 14px !important;
        }
        body.admin-light .glass-input-premium { background: #ffffff !important; }
        .x-small { font-size: 0.65rem; }
        .hide-caret::after { display: none !important; }
        .hover-scale-sm:hover { transform: scale(1.05); }
        .badge-premium {
          display: inline-block;
          padding: 0.35em 1.2em;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 100px;
          background: #6a0dad;
          color: #ffffff;
        }
      `}} />
    </AdminLayout>
  );
};

export default ProductsManagementPage;
