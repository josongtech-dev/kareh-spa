import React, { useState, useContext, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiSearch,
  FiDollarSign,
  FiX,
  FiRefreshCw,
  FiTrash2,
  FiClock,
  FiMoreHorizontal,
  FiEye,
  FiEdit,
  FiChevronDown,
  FiChevronRight,
  FiInbox,
  FiSmartphone,
  FiCreditCard,
  FiCheckCircle,
  FiAlertCircle,
  FiPrinter,
} from "react-icons/fi";
import AdminLayout, { AdminThemeContext } from "./AdminLayout";
import AdminModal from "../../components/admin/AdminModal";
import ConfirmModal from "../../components/admin/ConfirmModal";
import SuccessModal from "../../components/admin/SuccessModal";
import { sessionsApi } from "../../api/sessions";
import { staffApi } from "../../api/staff";
import { serviceApi } from "../../api/services";
import SearchableSelect from "../../components/admin/SearchableSelect";
import Receipt from "../../components/Receipt";
import { memberApi } from "../../api/members";
import { addonApi } from "../../api/addons";
import MonthFilterBar from "../../components/admin/MonthFilterBar";

const extractApiList = (response: any): any[] | null => {
  const payload = response?.data?.data ?? response?.data;
  return Array.isArray(payload) ? payload : null;
};

const extractCreatedSession = (response: any) => {
  const payload = response?.data?.data ?? response?.data;
  return payload?.session ?? null;
};

const getLoggedInStaffId = (): number => {
  try {
    const raw = localStorage.getItem("admin_user");
    if (raw) {
      const user = JSON.parse(raw);
      return Number(user.id) || 0;
    }
  } catch {}
  return 0;
};

const formatDateTime = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) +
    " " +
    d.toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit" })
  );
};

const SessionsManagementPage = () => {
  const { isDarkMode } = useContext(AdminThemeContext);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [sessions, setSessions] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createSourceType, setCreateSourceType] = useState<"walkin" | "member">(
    "walkin",
  );
  const [memberSearch, setMemberSearch] = useState("");
  const [createForm, setCreateForm] = useState({
    customer_name: "",
    client_phone: "",
    client_email: "",
    created_by: "",
  });
  const [createError, setCreateError] = useState("");

  const [addServiceSessionId, setAddServiceSessionId] = useState<number | null>(
    null,
  );
  const [addServiceId, setAddServiceId] = useState("");
  const [addServiceStaffId, setAddServiceStaffId] = useState("");
  const [addServiceError, setAddServiceError] = useState("");
  const [addServiceCategoryId, setAddServiceCategoryId] = useState<string>("");
  const [addons, setAddons] = useState<any[]>([]);
  const [addAddonId, setAddAddonId] = useState("");
  const [addAddonQty, setAddAddonQty] = useState(1);
  const [addFormTab, setAddFormTab] = useState<"service" | "addon">("service");

  const serviceCategories = React.useMemo(() => {
    const cats = new Map<number, string>();
    services.forEach((s: any) => {
      if (s.category_id && s.category_name)
        cats.set(Number(s.category_id), s.category_name);
    });
    return Array.from(cats.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [services]);

  const filteredServices = React.useMemo(() => {
    let list = services;
    if (addServiceCategoryId) {
      list = list.filter(
        (s: any) => String(s.category_id) === addServiceCategoryId,
      );
    }
    return list;
  }, [services, addServiceCategoryId]);

  const [showBillModal, setShowBillModal] = useState(false);
  const [billSession, setBillSession] = useState<any>(null);
  const [billPaymentMethod, setBillPaymentMethod] = useState<
    "MPESA" | "CARD" | "CASH" | ""
  >("");
  const [billTransactionCode, setBillTransactionCode] = useState("");
  const [billError, setBillError] = useState("");
  const [billLoading, setBillLoading] = useState(false);
  const [showCashReceipt, setShowCashReceipt] = useState(false);
  const [cashReceiptData, setCashReceiptData] = useState<any>(null);

  const [showPesapalModal, setShowPesapalModal] = useState(false);
  const [pesapalUrl, setPesapalUrl] = useState("");
  const [pesapalSessionId, setPesapalSessionId] = useState<number | null>(null);
  const [pesapalStatus, setPesapalStatus] = useState<
    "pending" | "completed" | "failed" | ""
  >("");
  const [pesapalMessage, setPesapalMessage] = useState("");
  const [_merchantReference, setMerchantReference] = useState("");
  const pesapalIntervalRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const [showViewModal, setShowViewModal] = useState(false);
  const [viewSession, setViewSession] = useState<any>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    customer_name: "",
    client_phone: "",
    client_email: "",
  });
  const [editSessionId, setEditSessionId] = useState<number | null>(null);
  const [editError, setEditError] = useState("");

  const [confirmAction, setConfirmAction] = useState<{
    type: string;
    payload: any;
  } | null>(null);

  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(
    new Set(),
  );

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [showBilled, setShowBilled] = useState<"all" | "paid" | "unpaid">(
    "all",
  );

  const loggedInStaffId = getLoggedInStaffId();

  useEffect(() => {
    setCreateForm((prev) => ({
      ...prev,
      created_by: loggedInStaffId ? String(loggedInStaffId) : "",
    }));
  }, [loggedInStaffId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sessionsRes, staffRes, servicesRes, membersRes, addonsRes] =
        await Promise.allSettled([
          sessionsApi.getAll(),
          staffApi.getAttendants(),
          serviceApi.getAll(),
          memberApi.getAll(),
          addonApi.getActive(),
        ]);
      if (sessionsRes.status === "fulfilled") {
        const list = extractApiList(sessionsRes.value);
        if (list) setSessions(list);
      }
      if (staffRes.status === "fulfilled") {
        const raw = staffRes.value.data?.data;
        setStaffList(Array.isArray(raw) ? raw : []);
      }
      if (servicesRes.status === "fulfilled") {
        const raw = servicesRes.value.data?.data;
        setServices(Array.isArray(raw) ? raw : []);
      }
      if (membersRes.status === "fulfilled") {
        const raw = membersRes.value.data?.data;
        setMembers(Array.isArray(raw) ? raw : []);
      }
      if (addonsRes.status === "fulfilled") {
        const raw = addonsRes.value.data?.data;
        setAddons(Array.isArray(raw) ? raw : []);
      }
    } catch (err) {
      console.error("fetchData error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const paymentStatus = searchParams.get("payment_status");
    const sessionId = searchParams.get("session_id");
    if (paymentStatus === "success" && sessionId) {
      setSuccessMsg("Payment completed successfully!");
      setShowSuccess(true);
      navigate("/admin/sessions", { replace: true });
    } else if (paymentStatus === "failed" && sessionId) {
      setSuccessMsg("Payment was not completed. You can retry below.");
      setShowSuccess(true);
      navigate("/admin/sessions", { replace: true });
    } else if (paymentStatus === "pending" && sessionId) {
      setSuccessMsg(
        "Payment is being processed. It will be confirmed shortly.",
      );
      setShowSuccess(true);
      navigate("/admin/sessions", { replace: true });
    }
  }, [searchParams, navigate]);

  const toggleExpand = (sessionId: number) => {
    setExpandedSessions((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) next.delete(sessionId);
      else next.add(sessionId);
      return next;
    });
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setCreateError("");
    try {
      const payload: any = {
        customer_name: createForm.customer_name || "Walk-in",
        client_phone: createForm.client_phone,
        client_email: createForm.client_email,
      };
      if (createForm.created_by)
        payload.created_by = Number(createForm.created_by);

      const res = await sessionsApi.create(payload);

      if (res?.data?.status !== "success") {
        throw new Error(res?.data?.message || "Failed to create session.");
      }

      const newSession = extractCreatedSession(res);
      if (!newSession?.id) {
        throw new Error("Session was not returned after creation.");
      }

      setShowCreateModal(false);
      setCreateForm({
        customer_name: "",
        client_phone: "",
        client_email: "",
        created_by: loggedInStaffId ? String(loggedInStaffId) : "",
      });
      setCreateSourceType("walkin");
      setMemberSearch("");

      setSessions((prev) => {
        const withoutDuplicate = prev.filter(
          (s: any) => String(s.id) !== String(newSession.id),
        );
        return [newSession, ...withoutDuplicate];
      });

      setSuccessMsg("Session created successfully.");
      setShowSuccess(true);
      await fetchData();
    } catch (error) {
      setCreateError(
        (error as any)?.response?.data?.message ||
          (error as Error)?.message ||
          "Failed to create session.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditSession = async () => {
    if (!editSessionId) return;
    setLoading(true);
    setEditError("");
    try {
      const res = await sessionsApi.update(editSessionId, {
        customer_name: editForm.customer_name,
        client_phone: editForm.client_phone,
        client_email: editForm.client_email,
      });

      if (res?.data?.status !== "success") {
        throw new Error(res?.data?.message || "Failed to update session.");
      }

      setShowEditModal(false);
      setEditSessionId(null);
      setEditForm({ customer_name: "", client_phone: "", client_email: "" });
      setSuccessMsg("Session updated successfully.");
      setShowSuccess(true);
      await fetchData();
    } catch (error) {
      setEditError(
        (error as any)?.response?.data?.message ||
          (error as Error)?.message ||
          "Failed to update session.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddService = async () => {
    if (!addServiceSessionId || !addServiceId) return;
    setLoading(true);
    setAddServiceError("");
    try {
      const svc = services.find((s) => String(s.id) === String(addServiceId));
      if (!svc) throw new Error("Service not found.");

      const res = await sessionsApi.addService(
        addServiceSessionId,
        Number(addServiceId),
        Number(String(svc.price).replace(/,/g, "")),
        addServiceStaffId ? Number(addServiceStaffId) : undefined,
      );

      if (res?.data?.data?.session) {
        setSessions((prev) =>
          prev.map((s) =>
            Number(s.id) === addServiceSessionId ? res.data.data.session : s,
          ),
        );
      }

      await fetchData();

      setAddServiceSessionId(null);
      setAddServiceId("");
      setAddServiceStaffId("");
      setAddServiceCategoryId("");
      setSuccessMsg("Service added successfully.");
      setShowSuccess(true);
    } catch (error) {
      setAddServiceError(
        (error as any)?.response?.data?.message || "Failed to add service.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddon = async () => {
    if (!addServiceSessionId || !addAddonId) return;
    setLoading(true);
    try {
      const res = await sessionsApi.addAddon(
        addServiceSessionId,
        Number(addAddonId),
        addAddonQty,
      );
      if (res?.data?.data?.session) {
        setSessions((prev) =>
          prev.map((s) =>
            Number(s.id) === addServiceSessionId ? res.data.data.session : s,
          ),
        );
      }
      await fetchData();
      setAddAddonId("");
      setAddAddonQty(1);
      setSuccessMsg("Addon added successfully.");
      setShowSuccess(true);
    } catch (error) {
      setAddServiceError(
        (error as any)?.response?.data?.message || "Failed to add addon.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAddon = async (_sessionId: number, addonLineId: number) => {
    setLoading(true);
    try {
      await sessionsApi.removeAddon(addonLineId);
      await fetchData();
      setSuccessMsg("Addon removed.");
      setShowSuccess(true);
    } catch (error) {
      console.error("Failed to remove addon:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBillSession = async () => {
    if (!billSession) return;
    setBillLoading(true);
    setBillError("");
    try {
      if (!billPaymentMethod) {
        setBillError("Please select a payment method.");
        setBillLoading(false);
        return;
      }

      if (billPaymentMethod === "CASH") {
        if (!billTransactionCode.trim()) {
          setBillError("Please enter the M-Pesa deposit transaction code.");
          setBillLoading(false);
          return;
        }
        const res = await sessionsApi.paySession(
          Number(billSession.id),
          billTransactionCode.trim(),
          "CASH",
        );
        const sessionData = res?.data?.data;
        if (!sessionData?.session) {
          throw new Error(
            sessionData?.message || "Failed to record cash payment.",
          );
        }
        setShowBillModal(false);
        setBillSession(null);
        setBillPaymentMethod("");
        setBillTransactionCode("");
        setCashReceiptData({
          ...sessionData.session,
          payment_method: "CASH",
        });
        setShowCashReceipt(true);
        await fetchData();
        return;
      }

      const res = await sessionsApi.initiatePayment(
        Number(billSession.id),
        billPaymentMethod,
      );
      const data = res?.data?.data;
      if (!data?.redirect_url) {
        throw new Error(data?.message || "Failed to initiate payment.");
      }

      setPesapalUrl(data.redirect_url);
      setPesapalSessionId(Number(billSession.id));
      setMerchantReference(data.merchant_reference || "");
      setPesapalStatus("pending");
      setPesapalMessage("Redirecting customer to payment...");

      sessionStorage.setItem(
        "pesapal_context",
        JSON.stringify({
          sessionId: billSession.id,
          paymentMethod: billPaymentMethod,
          merchantReference: data.merchant_reference || "",
        }),
      );

      setShowBillModal(false);
      setBillSession(null);
      setBillPaymentMethod("");
      setShowPesapalModal(true);
    } catch (error) {
      setBillError(
        (error as any)?.response?.data?.message ||
          (error as Error)?.message ||
          "Failed to initiate payment.",
      );
    } finally {
      setBillLoading(false);
    }
  };

  const handlePesapalIframeLoad = () => {
    setPesapalMessage("Waiting for payment confirmation...");
    startPesapalPolling();
  };

  const startPesapalPolling = () => {
    if (pesapalIntervalRef.current) clearInterval(pesapalIntervalRef.current);
    if (!pesapalSessionId) return;

    pesapalIntervalRef.current = setInterval(async () => {
      try {
        const res = await sessionsApi.getPaymentStatus(pesapalSessionId!);
        const data = res?.data?.data;
        if (data?.status === "completed") {
          setPesapalStatus("completed");
          setPesapalMessage("Payment completed!");
          if (pesapalIntervalRef.current)
            clearInterval(pesapalIntervalRef.current);
          setTimeout(() => {
            sessionStorage.removeItem("pesapal_context");
            setShowPesapalModal(false);
            setPesapalUrl("");
            setPesapalSessionId(null);
            setPesapalStatus("");
            setSuccessMsg("Session billed successfully.");
            setShowSuccess(true);
            fetchData();
          }, 2000);
        } else if (data?.status === "failed") {
          setPesapalStatus("failed");
          setPesapalMessage("Payment failed.");
          if (pesapalIntervalRef.current)
            clearInterval(pesapalIntervalRef.current);
          fetchData();
        } else if (data?.status === "cancelled") {
          setPesapalStatus("failed");
          setPesapalMessage("Payment was cancelled.");
          if (pesapalIntervalRef.current)
            clearInterval(pesapalIntervalRef.current);
          fetchData();
        }
      } catch {
        console.error("Polling error");
      }
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (pesapalIntervalRef.current) clearInterval(pesapalIntervalRef.current);
    };
  }, []);

  const openViewModal = (session: any) => {
    setViewSession(session);
    setShowViewModal(true);
  };

  const openEditModal = (session: any) => {
    setEditSessionId(session.id);
    setEditForm({
      customer_name: session.customer_name || "",
      client_phone: session.client_phone || "",
      client_email: session.client_email || "",
    });
    setEditError("");
    setShowEditModal(true);
  };

  const handleDeleteSession = async () => {
    if (!confirmAction || confirmAction.type !== "delete_session") return;
    setLoading(true);
    try {
      await sessionsApi.delete(confirmAction.payload);
      setConfirmAction(null);
      setSuccessMsg("Session deleted successfully.");
      setShowSuccess(true);
      await fetchData();
    } catch (error) {
      setSuccessMsg("Failed to delete session.");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveService = async () => {
    if (!confirmAction || confirmAction.type !== "remove_service") return;
    setLoading(true);
    try {
      const lineId = confirmAction.payload;
      await sessionsApi.removeService(lineId);
      await fetchData();
      setConfirmAction(null);
      setSuccessMsg("Service removed successfully.");
      setShowSuccess(true);
    } catch (error) {
      setSuccessMsg("Failed to remove service.");
      setShowSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((m: any) => {
    const q = memberSearch.toLowerCase();
    return (
      !q ||
      String(m.id).includes(q) ||
      String(m.name || "")
        .toLowerCase()
        .includes(q) ||
      String(m.email || "")
        .toLowerCase()
        .includes(q) ||
      String(m.phone || "").includes(q)
    );
  });

  const handleMemberPick = (member: any) => {
    setCreateForm((prev) => ({
      ...prev,
      customer_name: member.name || "",
      client_phone: member.phone || "",
      client_email: member.email || "",
    }));
  };

  const visibleSessions = sessions
    .filter((s: any) => {
      if (showBilled === "paid")
        return String(s.billing_status || "").toLowerCase() === "paid";
      if (showBilled === "unpaid")
        return String(s.billing_status || "").toLowerCase() !== "paid";
      return true;
    })
    .filter((s: any) => {
      if (!selectedMonth) return true;
      const [yr, mo] = selectedMonth.split("-").map(Number);
      const start = new Date(yr, mo - 1, 1);
      const end = new Date(yr, mo, 0, 23, 59, 59, 999);
      const dt = new Date(s.created_at);
      return dt >= start && dt <= end;
    })
    .filter(
      (s: any) =>
        !searchQuery ||
        s.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.session_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.client_phone?.includes(searchQuery) ||
        s.client_email?.toLowerCase().includes(searchQuery.toLowerCase()),
    );

  const getSessionTotal = (session: any) => {
    const lines = session?.service_lines || [];
    const servicesTotal = lines.reduce(
      (acc: number, l: any) =>
        acc + parseFloat(String(l.price || 0).replace(/,/g, "")),
      0,
    );
    const addonLines = session?.addon_lines || [];
    const addonsTotal = addonLines.reduce(
      (acc: number, a: any) =>
        acc +
        parseFloat(
          String(
            a.line_total || a.material_total + a.labour_total || 0,
          ).replace(/,/g, ""),
        ),
      0,
    );
    const computedTotal = servicesTotal + addonsTotal;
    if (computedTotal > 0) return computedTotal;
    return parseFloat(String(session?.total_amount || 0));
  };

  const totalPages = Math.max(1, Math.ceil(visibleSessions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const pagedSessions = visibleSessions.slice(pageStart, pageEnd);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, selectedMonth, showBilled, pageSize]);

  const isPaid = (s: any) =>
    String(s.billing_status || "").toLowerCase() === "paid";
  const isPaymentRequested = (s: any) =>
    String(s.billing_status || "").toLowerCase() === "payment_requested";
  const isFailed = (s: any) =>
    String(s.billing_status || "").toLowerCase() === "failed";
  const isCancelled = (s: any) =>
    String(s.billing_status || "").toLowerCase() === "cancelled";

  return (
    <AdminLayout>
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="brand-title text-gradient h2 mb-0">Sessions</h1>
            <p className="text-secondary small mb-0">
              Manage client sessions and services
            </p>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-bold d-flex align-items-center"
              onClick={fetchData}
              disabled={loading}
              title="Refresh sessions list"
            >
              <FiRefreshCw
                className={`me-1 ${loading ? "spinner-border spinner-border-sm" : ""}`}
              />{" "}
              REFRESH
            </button>
            <button
              className="btn btn-purple rounded-pill px-4 py-2 fw-bold d-flex align-items-center shadow-lg"
              onClick={() => setShowCreateModal(true)}
            >
              <FiPlus className="me-2" /> NEW SESSION
            </button>
          </div>
        </div>

        <div className="glass-panel p-3 rounded-4 mb-4 border-1 shadow-sm">
          <div className="row g-2 align-items-center">
            <div className="col-lg-4">
              <div className="position-relative">
                <FiSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-secondary" />
                <input
                  type="text"
                  className="form-control form-control-sm glass-input-simple ps-5"
                  placeholder="Search by code, client name, phone or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="col-lg-5">
              <MonthFilterBar
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
            <div className="col-lg-3">
              <select
                className="form-select glass-input-simple"
                value={showBilled}
                onChange={(e) => setShowBilled(e.target.value as any)}
              >
                <option value="all">All Sessions</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-4 overflow-hidden border-1 shadow-sm">
          <div className="table-responsive">
            <table className={`table mb-0 ${isDarkMode ? "table-dark" : ""}`}>
              <thead
                className={isDarkMode ? "bg-white bg-opacity-5" : "bg-light"}
              >
                <tr>
                  <th
                    className="px-4 py-3 border-0 small text-uppercase tracking-wider"
                    style={{ width: "12%" }}
                  >
                    Code
                  </th>
                  <th
                    className="px-4 py-3 border-0 small text-uppercase tracking-wider"
                    style={{ width: "26%" }}
                  >
                    Client
                  </th>
                  <th
                    className="px-4 py-3 border-0 small text-uppercase tracking-wider"
                    style={{ width: "15%" }}
                  >
                    Appointment
                  </th>
                  <th
                    className="px-4 py-3 border-0 small text-uppercase tracking-wider"
                    style={{ width: "16%" }}
                  >
                    Opened
                  </th>
                  <th
                    className="px-4 py-3 border-0 small text-uppercase tracking-wider text-center"
                    style={{ width: "10%" }}
                  >
                    Services
                  </th>
                  <th
                    className="px-4 py-3 border-0 small text-uppercase tracking-wider text-end"
                    style={{ width: "18%" }}
                  >
                    Payable
                  </th>
                  <th
                    className="px-4 py-3 border-0 small text-uppercase tracking-wider text-end"
                    style={{ width: "16%" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading && visibleSessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-5"
                    >
                      <div
                        className="spinner-border text-purple"
                        role="status"
                      >
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </td>
                  </tr>
                ) : visibleSessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-5"
                    >
                      <div className="text-secondary opacity-50">
                        <FiInbox
                          size={28}
                          className="mb-2 d-block mx-auto"
                        />
                        <span className="small">No sessions found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pagedSessions.map((session) => (
                    <React.Fragment key={session.id}>
                      <tr
                        className={`align-middle border-bottom border-opacity-10 ${isDarkMode ? "border-light border-opacity-5" : ""}`}
                        style={{
                          borderBottomWidth:
                            (session.service_lines || []).length > 0 &&
                            expandedSessions.has(session.id)
                              ? "0px"
                              : undefined,
                          cursor:
                            (session.service_lines || []).length > 0
                              ? "pointer"
                              : undefined,
                          userSelect: "none",
                        }}
                        onClick={(e) => {
                          const target = e.target as HTMLElement;
                          if (
                            target.closest(
                              "button, select, input, a, textarea, .dropdown-menu, .dropdown-item",
                            )
                          )
                            return;
                          if ((session.service_lines || []).length > 0)
                            toggleExpand(session.id);
                        }}
                      >
                        <td className="px-4 py-3 border-0">
                          <div className="d-flex align-items-center gap-2">
                            {(session.service_lines || []).length > 0 && (
                              <span
                                className="d-inline-flex align-items-center justify-content-center flex-shrink-0 text-purple"
                                style={{ width: 18, height: 18 }}
                              >
                                {expandedSessions.has(session.id) ? (
                                  <FiChevronDown size={14} />
                                ) : (
                                  <FiChevronRight size={14} />
                                )}
                              </span>
                            )}
                            {(session.service_lines || []).length === 0 && (
                              <span
                                style={{ width: 18, display: "inline-block" }}
                              />
                            )}
                            <span className="small text-secondary font-monospace">
                              {session.session_code}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-0">
                          <div className="d-flex align-items-center gap-2">
                            <div>
                              <div className="fw-bold small">
                                {session.customer_name}
                              </div>
                              <div className="x-small text-muted">
                                {session.client_phone || session.client_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-0">
                          <div className="small">
                            {session.appointment_code ? (
                              <span className="text-secondary font-monospace">
                                {session.appointment_code}
                              </span>
                            ) : (
                              <span className="x-small text-muted">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-0">
                          <div className="d-flex align-items-center gap-1 small text-secondary">
                            <FiClock
                              size={11}
                              className="flex-shrink-0 opacity-50"
                            />
                            <span className="small">
                              {formatDateTime(session.created_at)}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-0 text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <span className="badge rounded-pill bg-secondary bg-opacity-10 text-secondary fw-bold">
                              {session.service_lines?.length || 0}
                            </span>
                            {!isPaid(session) && (
                              <button
                                className="btn btn-sm rounded-pill px-2 py-0 x-small text-nowrap text-purple fw-bold"
                                style={{
                                  border: "1px solid rgba(106, 13, 173, 0.25)",
                                  background: "rgba(106, 13, 173, 0.06)",
                                }}
                                onClick={() => {
                                  setAddServiceSessionId(session.id);
                                  setAddServiceId("");
                                  setAddServiceStaffId("");
                                  setAddServiceError("");
                                  setAddServiceCategoryId("");
                                }}
                              >
                                <FiPlus
                                  size={11}
                                  className="me-1"
                                />{" "}
                                ADD
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 border-0 text-end">
                          <div className="fw-bold small text-body">
                            KES {getSessionTotal(session).toLocaleString()}
                          </div>
                          <span
                            className={`badge rounded-pill mt-1 ${isPaid(session) ? "bg-success bg-opacity-90" : isFailed(session) ? "bg-danger bg-opacity-90" : isCancelled(session) ? "bg-secondary bg-opacity-50" : isPaymentRequested(session) ? "bg-info text-dark" : "bg-warning bg-opacity-75 text-dark"}`}
                            style={{ fontSize: "0.55rem" }}
                          >
                            {isPaid(session)
                              ? "PAID"
                              : isFailed(session)
                                ? "FAILED"
                                : isCancelled(session)
                                  ? "CANCELLED"
                                  : isPaymentRequested(session)
                                    ? "PENDING"
                                    : "UNPAID"}
                          </span>
                        </td>
                        <td className="px-4 py-3 border-0 text-end">
                          <div className="d-flex gap-1 justify-content-end align-items-center">
                            {!isPaid(session) && (
                              <button
                                className="btn btn-sm rounded-pill px-2 py-1 x-small text-nowrap text-white"
                                style={{ background: "#198754" }}
                                onClick={() => {
                                  setBillSession(session);
                                  setBillPaymentMethod("");
                                  setBillError("");
                                  setShowBillModal(true);
                                }}
                              >
                                <FiDollarSign
                                  size={11}
                                  className="me-1"
                                />{" "}
                                BILL
                              </button>
                            )}
                            <div className="dropdown">
                              <button
                                className={`btn btn-sm p-1 rounded-circle border-0 ${isDarkMode ? "text-white hover-bg-white-10" : "text-dark hover-bg-black-10"}`}
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                aria-label="Session actions"
                              >
                                <FiMoreHorizontal size={16} />
                              </button>
                              <ul
                                className={`dropdown-menu dropdown-menu-end shadow-lg border-opacity-10 ${isDarkMode ? "dropdown-menu-dark" : ""}`}
                              >
                                <li>
                                  <h6 className="dropdown-header small text-uppercase tracking-wider opacity-50">
                                    Actions
                                  </h6>
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item d-flex align-items-center py-2"
                                    type="button"
                                    onClick={() => openViewModal(session)}
                                  >
                                    <FiEye
                                      className="me-2"
                                      size={14}
                                    />{" "}
                                    View
                                  </button>
                                </li>
                                {!isPaid(session) && (
                                  <li>
                                    <button
                                      className="dropdown-item d-flex align-items-center py-2"
                                      type="button"
                                      onClick={() => openEditModal(session)}
                                    >
                                      <FiEdit
                                        className="me-2"
                                        size={14}
                                      />{" "}
                                      Edit
                                    </button>
                                  </li>
                                )}
                                <li>
                                  <hr className="dropdown-divider opacity-10" />
                                </li>
                                <li>
                                  <button
                                    className="dropdown-item d-flex align-items-center py-2 text-danger"
                                    type="button"
                                    onClick={() =>
                                      setConfirmAction({
                                        type: "delete_session",
                                        payload: session.id,
                                      })
                                    }
                                  >
                                    <FiTrash2
                                      className="me-2"
                                      size={14}
                                    />{" "}
                                    Delete
                                  </button>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>

                      {expandedSessions.has(session.id) &&
                        (session.service_lines || []).length > 0 && (
                          <tr className="border-bottom border-opacity-10">
                            <td
                              colSpan={6}
                              className="py-0 px-0 border-0"
                            >
                              <div
                                className="ms-4 me-4 mb-2 mt-2 overflow-hidden rounded-3"
                                style={{
                                  border: "1px solid rgba(128, 128, 128, 0.12)",
                                }}
                              >
                                <table
                                  className={`table table-borderless mb-0 ${isDarkMode ? "table-dark bg-opacity-25" : ""}`}
                                  style={{
                                    background: isDarkMode
                                      ? "rgba(255,255,255,0.02)"
                                      : "rgba(0,0,0,0.008)",
                                  }}
                                >
                                  <thead>
                                    <tr
                                      className="x-small text-uppercase tracking-wider text-secondary"
                                      style={{
                                        borderBottom:
                                          "1px solid rgba(128, 128, 128, 0.08)",
                                      }}
                                    >
                                      <th
                                        className="fw-normal pb-1 ps-3 pt-2 border-0 opacity-75"
                                        style={{ width: "40%" }}
                                      >
                                        Service
                                      </th>
                                      <th
                                        className="fw-normal pb-1 pt-2 border-0 opacity-75"
                                        style={{ width: "25%" }}
                                      >
                                        Attendant
                                      </th>
                                      <th
                                        className="fw-normal pb-1 pt-2 border-0 text-end opacity-75"
                                        style={{ width: "20%" }}
                                      >
                                        Price
                                      </th>
                                      <th
                                        className="pb-1 pt-2 border-0 text-end"
                                        style={{ width: "15%" }}
                                      ></th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {session.service_lines.map(
                                      (line: any, idx: number) => (
                                        <tr
                                          key={line.id}
                                          className={
                                            idx <
                                            session.service_lines.length - 1
                                              ? "border-bottom"
                                              : ""
                                          }
                                          style={{
                                            borderColor:
                                              "rgba(128, 128, 128, 0.06)",
                                          }}
                                        >
                                          <td className="ps-3 py-2 border-0">
                                            <span className="fw-semibold small">
                                              {line.service_name}
                                            </span>
                                            {line.is_from_appointment == 1 && (
                                              <span
                                                className="badge rounded-pill bg-info bg-opacity-10 text-info x-small ms-2"
                                                style={{ fontSize: "0.5rem" }}
                                              >
                                                DEFAULT
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 border-0">
                                            {line.assigned_staff_name ? (
                                              <span className="small text-secondary">
                                                {line.assigned_staff_name}
                                              </span>
                                            ) : (
                                              <span className="x-small text-muted">
                                                —
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 border-0 text-end">
                                            <span className="small text-secondary">
                                              KES{" "}
                                              {parseFloat(
                                                String(line.price || 0).replace(
                                                  /,/g,
                                                  "",
                                                ),
                                              ).toLocaleString()}
                                            </span>
                                          </td>
                                          <td className="py-2 border-0 text-end">
                                            {!isPaid(session) && (
                                              <button
                                                className="btn btn-sm p-0 border-0 text-secondary opacity-40"
                                                style={{
                                                  background: "none",
                                                  width: 20,
                                                  height: 20,
                                                  lineHeight: "20px",
                                                  fontSize: 14,
                                                }}
                                                onClick={() =>
                                                  setConfirmAction({
                                                    type: "remove_service",
                                                    payload: line.id,
                                                  })
                                                }
                                                title="Remove service"
                                              >
                                                <FiX />
                                              </button>
                                            )}
                                          </td>
                                        </tr>
                                      ),
                                    )}
                                    {(session.addon_lines || []).length > 0 && (
                                      <>
                                        <tr
                                          style={{
                                            borderTop:
                                              "1px dashed rgba(128,128,128,0.15)",
                                          }}
                                        >
                                          <td
                                            colSpan={4}
                                            className="ps-3 py-1 border-0"
                                          >
                                            <small className="text-secondary opacity-50">
                                              ADD-ONS
                                            </small>
                                          </td>
                                        </tr>
                                        {session.addon_lines.map(
                                          (a: any, idx: number) => {
                                            const matTotal = Number(
                                              a.material_total ||
                                                a.material_price * a.quantity,
                                            );
                                            const labTotal = Number(
                                              a.labour_total ||
                                                a.labour_price * a.quantity,
                                            );
                                            const lineTotal = Number(
                                              a.line_total ||
                                                matTotal + labTotal,
                                            );
                                            return (
                                              <tr
                                                key={a.id}
                                                className={
                                                  idx <
                                                  (session.addon_lines || [])
                                                    .length -
                                                    1
                                                    ? "border-bottom"
                                                    : ""
                                                }
                                                style={{
                                                  borderColor:
                                                    "rgba(128, 128, 128, 0.06)",
                                                }}
                                              >
                                                <td className="ps-3 py-2 border-0">
                                                  <span className="small">
                                                    {a.addon_name || a.name}{" "}
                                                    <span className="text-secondary opacity-50">
                                                      &times;{a.quantity}
                                                    </span>
                                                  </span>
                                                </td>
                                                <td className="py-2 border-0">
                                                  <span className="x-small text-secondary">
                                                    {a.material_price
                                                      ? `Mat: KES ${(a.material_price * a.quantity).toLocaleString()}`
                                                      : ""}
                                                    {a.material_price &&
                                                    a.labour_price
                                                      ? " + "
                                                      : ""}
                                                    {a.labour_price
                                                      ? `Lab: KES ${(a.labour_price * a.quantity).toLocaleString()}`
                                                      : ""}
                                                  </span>
                                                </td>
                                                <td className="py-2 border-0 text-end">
                                                  <span className="small text-secondary">
                                                    KES{" "}
                                                    {lineTotal.toLocaleString()}
                                                  </span>
                                                </td>
                                                <td className="py-2 border-0 text-end">
                                                  {!isPaid(session) && (
                                                    <button
                                                      className="btn btn-sm p-0 border-0 text-secondary opacity-40"
                                                      style={{
                                                        background: "none",
                                                        width: 20,
                                                        height: 20,
                                                        lineHeight: "20px",
                                                        fontSize: 14,
                                                      }}
                                                      onClick={() =>
                                                        handleRemoveAddon(
                                                          Number(session.id),
                                                          a.id,
                                                        )
                                                      }
                                                      title="Remove add-on"
                                                    >
                                                      <FiX />
                                                    </button>
                                                  )}
                                                </td>
                                              </tr>
                                            );
                                          },
                                        )}
                                      </>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </td>
                          </tr>
                        )}

                      {addServiceSessionId === session.id && (
                        <>
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(128,128,128,0.08)",
                            }}
                          >
                            <td
                              colSpan={6}
                              className="px-4 pt-2 pb-0 border-0"
                            >
                              <div
                                className="d-flex align-items-center"
                                style={{
                                  borderBottom:
                                    "1px solid rgba(128,128,128,0.06)",
                                }}
                              >
                                <div
                                  className="d-flex rounded-3 overflow-hidden me-3"
                                  style={{
                                    border: "1px solid rgba(128,128,128,0.15)",
                                  }}
                                >
                                  <button
                                    className="btn btn-sm px-3 py-1 border-0 rounded-0 small fw-semibold"
                                    style={{
                                      background:
                                        addFormTab === "service"
                                          ? "#6a0dad"
                                          : "transparent",
                                      color:
                                        addFormTab === "service"
                                          ? "#fff"
                                          : "#888",
                                    }}
                                    onClick={() => setAddFormTab("service")}
                                  >
                                    + Service
                                  </button>
                                  <button
                                    className="btn btn-sm px-3 py-1 border-0 rounded-0 small fw-semibold"
                                    style={{
                                      background:
                                        addFormTab === "addon"
                                          ? "#6a0dad"
                                          : "transparent",
                                      color:
                                        addFormTab === "addon"
                                          ? "#fff"
                                          : "#888",
                                      borderLeft:
                                        "1px solid rgba(128,128,128,0.15)",
                                    }}
                                    onClick={() => setAddFormTab("addon")}
                                  >
                                    + Add-ons
                                  </button>
                                </div>
                                <button
                                  className="btn btn-sm p-0 border-0 text-secondary opacity-50 ms-auto"
                                  style={{ background: "none", lineHeight: 1 }}
                                  onClick={() => {
                                    setAddServiceSessionId(null);
                                    setAddFormTab("service");
                                  }}
                                  title="Cancel"
                                >
                                  <FiX size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                          {addFormTab === "service" && (
                            <tr className="border-bottom border-opacity-10">
                              <td
                                colSpan={6}
                                className="px-4 py-2 border-0"
                              >
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <div style={{ minWidth: "150px" }}>
                                    <SearchableSelect
                                      value={addServiceCategoryId}
                                      onChange={setAddServiceCategoryId}
                                      options={[
                                        { value: "", label: "All categories" },
                                        ...serviceCategories.map((c) => ({
                                          value: String(c.id),
                                          label: c.name,
                                        })),
                                      ]}
                                      placeholder="Category..."
                                    />
                                  </div>
                                  <div style={{ minWidth: "200px" }}>
                                    <SearchableSelect
                                      value={addServiceId}
                                      onChange={(val) => {
                                        setAddServiceId(val);
                                        if (val) {
                                          const svc = services.find(
                                            (s: any) => String(s.id) === val,
                                          );
                                          if (svc?.category_id)
                                            setAddServiceCategoryId(
                                              String(svc.category_id),
                                            );
                                        }
                                      }}
                                      options={[
                                        { value: "", label: "Service..." },
                                        ...filteredServices.map((s: any) => ({
                                          value: String(s.id),
                                          label: `${s.name}  —  KES ${parseFloat(s.price).toLocaleString()}`,
                                        })),
                                      ]}
                                      placeholder="Service..."
                                    />
                                  </div>
                                  <div style={{ minWidth: "150px" }}>
                                    <SearchableSelect
                                      value={addServiceStaffId}
                                      onChange={setAddServiceStaffId}
                                      options={[
                                        { value: "", label: "Staff..." },
                                        ...staffList
                                          .filter(
                                            (s: any) => s.status === "Active",
                                          )
                                          .map((s: any) => ({
                                            value: String(s.id),
                                            label: `${s.name} (${s.skill || "Generalist"})`,
                                          })),
                                      ]}
                                      placeholder="Staff..."
                                    />
                                  </div>
                                  <button
                                    className="btn btn-sm rounded-pill px-2 py-0 x-small text-nowrap text-white"
                                    style={{ background: "#6a0dad" }}
                                    disabled={loading || !addServiceId}
                                    onClick={handleAddService}
                                  >
                                    <FiPlus
                                      size={10}
                                      className="me-1"
                                    />{" "}
                                    {loading ? "ADDING" : "ADD"}
                                  </button>
                                  {addServiceError && (
                                    <span className="text-danger x-small">
                                      {addServiceError}
                                    </span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          )}
                          {addFormTab === "addon" && (
                            <tr className="border-bottom border-opacity-10">
                              <td
                                colSpan={6}
                                className="px-4 py-2 border-0"
                              >
                                <div className="d-flex align-items-center gap-2 flex-wrap">
                                  <div style={{ minWidth: "180px" }}>
                                    <SearchableSelect
                                      value={addAddonId}
                                      onChange={setAddAddonId}
                                      options={[
                                        { value: "", label: "Add-on..." },
                                        ...addons.map((a: any) => ({
                                          value: String(a.id),
                                          label: `${a.name}  —  Mat KES ${Number(a.material_price).toLocaleString()} + Lab KES ${Number(a.labour_price).toLocaleString()}  =  KES ${(Number(a.material_price) + Number(a.labour_price)).toLocaleString()}${a.bulk_after ? ` (bulk ${a.bulk_after}+: KES ${(Number(a.material_price) + Number(a.bulk_labour_price)).toLocaleString()})` : ""}`,
                                        })),
                                      ]}
                                      placeholder="Add-on..."
                                    />
                                  </div>
                                  <div style={{ minWidth: "60px" }}>
                                    <input
                                      type="number"
                                      className="form-control form-control-sm rounded-3"
                                      min={1}
                                      value={addAddonQty}
                                      onChange={(e) =>
                                        setAddAddonQty(
                                          Math.max(1, Number(e.target.value)),
                                        )
                                      }
                                      style={{
                                        background: isDarkMode
                                          ? "#1e1e1e"
                                          : "#fff",
                                        color: isDarkMode ? "#e0e0e0" : "#000",
                                        borderColor: isDarkMode
                                          ? "#333"
                                          : "#ccc",
                                      }}
                                    />
                                  </div>
                                  <button
                                    className="btn btn-sm rounded-pill px-2 py-0 x-small text-nowrap text-white"
                                    style={{ background: "#6a0dad" }}
                                    disabled={loading || !addAddonId}
                                    onClick={handleAddAddon}
                                    title="Add add-on"
                                  >
                                    <FiPlus
                                      size={10}
                                      className="me-1"
                                    />{" "}
                                    ADD
                                  </button>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      )}
                    </React.Fragment>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {visibleSessions.length > 0 && (
            <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 px-3 py-3 border-top border-opacity-10">
              <div className="small text-secondary">
                Showing {pageStart + 1}-
                {Math.min(pageEnd, visibleSessions.length)} of{" "}
                {visibleSessions.length}
              </div>
              <div className="d-flex align-items-center gap-3">
                <div className="d-flex align-items-center gap-2">
                  <label className="small text-secondary mb-0">Rows</label>
                  <select
                    className="form-select form-select-sm"
                    style={{ width: 80 }}
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                  >
                    {[15, 30, 50, 100].map((s) => (
                      <option
                        key={s}
                        value={s}
                      >
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="d-flex gap-1">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    disabled={safePage <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                    disabled={safePage >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setCreateError("");
        }}
        title="New Session"
        subtitle="Create a new client session"
        isDarkMode={isDarkMode}
        maxWidth="520px"
      >
        <form onSubmit={handleCreateSession}>
          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
              Client Source
            </label>
            <div className="d-flex gap-2">
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${createSourceType === "walkin" ? "btn-purple" : "btn-outline-secondary"}`}
                onClick={() => {
                  setCreateSourceType("walkin");
                  setCreateForm((prev) => ({
                    ...prev,
                    customer_name: "",
                    client_phone: "",
                    client_email: "",
                  }));
                  setMemberSearch("");
                }}
              >
                Walk-in
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill px-3 ${createSourceType === "member" ? "btn-purple" : "btn-outline-secondary"}`}
                onClick={() => {
                  setCreateSourceType("member");
                  setCreateForm((prev) => ({
                    ...prev,
                    customer_name: "",
                    client_phone: "",
                    client_email: "",
                  }));
                }}
              >
                Member
              </button>
            </div>
          </div>

          {createSourceType === "member" && (
            <div className="mb-3 p-3 rounded-4 border border-opacity-10">
              <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
                Search Member
              </label>
              <input
                type="text"
                className="form-control glass-input-premium mb-2"
                placeholder="Search member..."
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
              <div
                className="list-group"
                style={{ maxHeight: "200px", overflowY: "auto" }}
              >
                {filteredMembers.map((m: any) => (
                  <button
                    type="button"
                    key={m.id}
                    className="list-group-item list-group-item-action d-flex justify-content-between align-items-center py-2"
                    onClick={() => handleMemberPick(m)}
                  >
                    <span className="fw-semibold small">{m.name}</span>
                    <span className="x-small text-muted">
                      {m.phone || m.email}
                    </span>
                  </button>
                ))}
                {memberSearch && filteredMembers.length === 0 && (
                  <div className="x-small text-muted py-2 text-center">
                    No members found
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
              Client Name
            </label>
            <input
              type="text"
              className="form-control glass-input-premium"
              placeholder="Client name"
              value={createForm.customer_name}
              onChange={(e) =>
                setCreateForm({ ...createForm, customer_name: e.target.value })
              }
              readOnly={
                createSourceType === "member" && !!createForm.customer_name
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
              Client Phone
            </label>
            <input
              type="tel"
              className="form-control glass-input-premium"
              placeholder="+254..."
              value={createForm.client_phone}
              onChange={(e) =>
                setCreateForm({ ...createForm, client_phone: e.target.value })
              }
              readOnly={
                createSourceType === "member" && !!createForm.customer_name
              }
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
              Client Email
            </label>
            <input
              type="email"
              className="form-control glass-input-premium"
              placeholder="client@example.com"
              value={createForm.client_email}
              onChange={(e) =>
                setCreateForm({ ...createForm, client_email: e.target.value })
              }
              readOnly={
                createSourceType === "member" && !!createForm.customer_name
              }
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
              Attended By <span className="text-muted">(optional)</span>
            </label>
            <select
              className="form-select glass-input-premium"
              value={createForm.created_by}
              onChange={(e) =>
                setCreateForm({ ...createForm, created_by: e.target.value })
              }
            >
              <option value="">Auto (you)</option>
              {staffList
                .filter((s: any) => s.status === "Active")
                .map((s: any) => (
                  <option
                    key={s.id}
                    value={String(s.id)}
                  >
                    {s.name}
                  </option>
                ))}
            </select>
          </div>
          {createError && (
            <div className="alert alert-danger py-2 small">{createError}</div>
          )}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn px-4 py-2 rounded-pill fw-bold text-secondary"
              onClick={() => setShowCreateModal(false)}
            >
              CANCEL
            </button>
            <button
              type="submit"
              className="btn btn-purple px-4 py-2 rounded-pill fw-bold shadow-lg"
              disabled={loading}
            >
              {loading ? "CREATING..." : "CREATE SESSION"}
            </button>
          </div>
        </form>
      </AdminModal>

      <AdminModal
        isOpen={showViewModal && !!viewSession}
        onClose={() => {
          setShowViewModal(false);
          setViewSession(null);
        }}
        title={`Session ${viewSession?.session_code || ""}`}
        subtitle={viewSession?.customer_name || ""}
        isDarkMode={isDarkMode}
        maxWidth="560px"
      >
        {viewSession && (
          <div>
            <div className="p-3 rounded-4 border border-opacity-10 mb-3">
              <div className="row g-3 small">
                <div className="col-6">
                  <span className="text-secondary">Client</span>
                  <div className="fw-semibold">{viewSession.customer_name}</div>
                </div>
                <div className="col-6">
                  <span className="text-secondary">Phone</span>
                  <div className="fw-semibold">
                    {viewSession.client_phone || "—"}
                  </div>
                </div>
                <div className="col-6">
                  <span className="text-secondary">Email</span>
                  <div className="fw-semibold">
                    {viewSession.client_email || "—"}
                  </div>
                </div>
                <div className="col-6">
                  <span className="text-secondary">Status</span>
                  <div>
                    <span
                      className={`badge rounded-pill ${isPaid(viewSession) ? "bg-success" : isFailed(viewSession) ? "bg-danger" : isCancelled(viewSession) ? "bg-secondary" : isPaymentRequested(viewSession) ? "bg-info text-dark" : "bg-warning text-dark"}`}
                    >
                      {isPaid(viewSession)
                        ? "PAID"
                        : isFailed(viewSession)
                          ? "FAILED"
                          : isCancelled(viewSession)
                            ? "CANCELLED"
                            : isPaymentRequested(viewSession)
                              ? "PENDING"
                              : "UNPAID"}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <span className="text-secondary">Opened</span>
                  <div className="fw-semibold">
                    {formatDateTime(viewSession.created_at)}
                  </div>
                </div>
                <div className="col-6">
                  <span className="text-secondary">Created By</span>
                  <div className="fw-semibold">
                    {viewSession.created_by_name || "—"}
                  </div>
                </div>
                <div className="col-6">
                  <span className="text-secondary">Appointment</span>
                  <div className="fw-semibold">
                    {viewSession.appointment_code || "—"}
                  </div>
                </div>
                {isPaid(viewSession) && (
                  <>
                    <div className="col-6">
                      <span className="text-secondary">Paid At</span>
                      <div className="fw-semibold">
                        {formatDateTime(viewSession.paid_at)}
                      </div>
                    </div>
                    <div className="col-6">
                      <span className="text-secondary">Transaction Code</span>
                      <div className="fw-semibold">
                        {viewSession.payment_transaction_code || "—"}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <h6 className="small text-uppercase tracking-wider text-secondary fw-bold mb-2">
              Services
            </h6>
            {(viewSession.service_lines || []).length === 0 ? (
              <p className="x-small text-muted">No services added.</p>
            ) : (
              <div className="rounded-3 overflow-hidden border border-opacity-10">
                <table className="table table-borderless mb-0 small">
                  <tbody>
                    {viewSession.service_lines.map((line: any) => (
                      <tr
                        key={line.id}
                        className="border-bottom border-opacity-5"
                      >
                        <td className="ps-3 py-2 border-0">
                          <span className="fw-semibold">
                            {line.service_name}
                          </span>
                          {line.is_from_appointment == 1 && (
                            <span
                              className="badge rounded-pill bg-info bg-opacity-10 text-info x-small ms-2"
                              style={{ fontSize: "0.5rem" }}
                            >
                              DEFAULT
                            </span>
                          )}
                        </td>
                        <td className="py-2 border-0">
                          {line.assigned_staff_name || "—"}
                        </td>
                        <td className="py-2 border-0 text-end pe-3">
                          KES{" "}
                          {parseFloat(
                            String(line.price || 0).replace(/,/g, ""),
                          ).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {(viewSession.addon_lines || []).length > 0 && (
              <>
                <h6 className="small text-uppercase tracking-wider text-secondary fw-bold mb-2 mt-3">
                  Add-ons
                </h6>
                <div className="rounded-3 overflow-hidden border border-opacity-10">
                  <table className="table table-borderless mb-0 small">
                    <tbody>
                      {viewSession.addon_lines.map((a: any) => {
                        const lineTotal = Number(
                          a.line_total ||
                            (a.material_price + a.labour_price) * a.quantity ||
                            0,
                        );
                        return (
                          <tr
                            key={a.id}
                            className="border-bottom border-opacity-5"
                          >
                            <td className="ps-3 py-2 border-0">
                              <span className="fw-semibold">
                                {a.addon_name || a.name}{" "}
                                <span className="text-secondary opacity-50">
                                  &times;{a.quantity}
                                </span>
                              </span>
                            </td>
                            <td className="py-2 border-0 text-secondary">
                              {a.material_price
                                ? `Mat: KES ${(a.material_price * a.quantity).toLocaleString()}`
                                : ""}
                              {a.material_price && a.labour_price ? " + " : ""}
                              {a.labour_price
                                ? `Lab: KES ${(a.labour_price * a.quantity).toLocaleString()}`
                                : ""}
                            </td>
                            <td className="py-2 border-0 text-end pe-3">
                              KES {lineTotal.toLocaleString()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            )}
            <div className="d-flex justify-content-between pt-3 mt-2 border-top border-opacity-10">
              <span className="fw-bold small">Total</span>
              <span className="fw-bold text-purple">
                KES {getSessionTotal(viewSession).toLocaleString()}
              </span>
            </div>
            {isPaid(viewSession) && viewSession.pesapal_order_tracking_id && (
              <div className="d-flex justify-content-end mt-2 no-print">
                <a
                  href={`/payment/callback?order_tracking_id=${viewSession.pesapal_order_tracking_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3 py-1 d-flex align-items-center gap-1"
                  style={{ fontSize: 12 }}
                >
                  <FiPrinter size={12} /> Receipt
                </a>
              </div>
            )}
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditSessionId(null);
          setEditError("");
        }}
        title="Edit Session"
        subtitle="Update client details"
        isDarkMode={isDarkMode}
        maxWidth="480px"
      >
        <div className="mb-3">
          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
            Client Name
          </label>
          <input
            type="text"
            className="form-control glass-input-premium"
            value={editForm.customer_name}
            onChange={(e) =>
              setEditForm({ ...editForm, customer_name: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
            Client Phone
          </label>
          <input
            type="tel"
            className="form-control glass-input-premium"
            value={editForm.client_phone}
            onChange={(e) =>
              setEditForm({ ...editForm, client_phone: e.target.value })
            }
          />
        </div>
        <div className="mb-3">
          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary">
            Client Email
          </label>
          <input
            type="email"
            className="form-control glass-input-premium"
            value={editForm.client_email}
            onChange={(e) =>
              setEditForm({ ...editForm, client_email: e.target.value })
            }
          />
        </div>
        {editError && (
          <div className="alert alert-danger py-2 small">{editError}</div>
        )}
        <div className="d-flex justify-content-end gap-2">
          <button
            className="btn px-4 py-2 rounded-pill fw-bold text-secondary"
            onClick={() => setShowEditModal(false)}
          >
            CANCEL
          </button>
          <button
            className="btn btn-purple px-4 py-2 rounded-pill fw-bold shadow-lg"
            disabled={loading}
            onClick={handleEditSession}
          >
            {loading ? "SAVING..." : "SAVE CHANGES"}
          </button>
        </div>
      </AdminModal>

      <AdminModal
        isOpen={showBillModal}
        onClose={() => {
          setShowBillModal(false);
          setBillSession(null);
          setBillError("");
        }}
        title="Bill Session"
        subtitle={
          billSession
            ? `${billSession.session_code} - ${billSession.customer_name}`
            : ""
        }
        isDarkMode={isDarkMode}
        maxWidth="480px"
      >
        {billSession && (
          <div>
            <div className="p-3 rounded-4 border border-opacity-10 mb-4">
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-secondary">Client</span>
                <span className="fw-bold">{billSession.customer_name}</span>
              </div>
              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-secondary">Services Total</span>
                <span className="fw-bold">
                  KES {getSessionTotal(billSession).toLocaleString()}
                </span>
              </div>
              <div className="d-flex justify-content-between pt-2 border-top border-opacity-10">
                <span className="fw-bold">Total Due</span>
                <span className="fw-bold text-purple h5 mb-0">
                  KES {getSessionTotal(billSession).toLocaleString()}
                </span>
              </div>
            </div>

            <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-3">
              Select Payment Method
            </label>
            <div className="d-flex gap-3 mb-4">
              <button
                type="button"
                className={`d-flex align-items-center gap-3 p-3 rounded-4 border flex-fill text-start transition-all ${billPaymentMethod === "MPESA" ? "border-success bg-success bg-opacity-10" : "border-opacity-20 bg-transparent"}`}
                style={{
                  border: `2px solid ${billPaymentMethod === "MPESA" ? "#198754" : "rgba(128,128,128,0.2)"}`,
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  setBillPaymentMethod("MPESA");
                  setBillTransactionCode("");
                }}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${billPaymentMethod === "MPESA" ? "bg-success" : "bg-secondary bg-opacity-10"}`}
                  style={{ width: 44, height: 44 }}
                >
                  <FiSmartphone
                    size={20}
                    className={
                      billPaymentMethod === "MPESA"
                        ? "text-white"
                        : "text-secondary"
                    }
                  />
                </div>
                <div>
                  <div
                    className={`fw-bold small ${billPaymentMethod === "MPESA" ? "text-success" : ""}`}
                  >
                    M-Pesa
                  </div>
                  <div className="x-small text-secondary">Mobile money</div>
                </div>
                {billPaymentMethod === "MPESA" && (
                  <FiCheckCircle
                    className="ms-auto text-success"
                    size={18}
                  />
                )}
              </button>
              <button
                type="button"
                className={`d-flex align-items-center gap-3 p-3 rounded-4 border flex-fill text-start transition-all ${billPaymentMethod === "CARD" ? "border-purple bg-purple bg-opacity-10" : "border-opacity-20 bg-transparent"}`}
                style={{
                  border: `2px solid ${billPaymentMethod === "CARD" ? "#6a0dad" : "rgba(128,128,128,0.2)"}`,
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  setBillPaymentMethod("CARD");
                  setBillTransactionCode("");
                }}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${billPaymentMethod === "CARD" ? "bg-purple" : "bg-secondary bg-opacity-10"}`}
                  style={{ width: 44, height: 44 }}
                >
                  <FiCreditCard
                    size={20}
                    className={
                      billPaymentMethod === "CARD"
                        ? "text-white"
                        : "text-secondary"
                    }
                  />
                </div>
                <div>
                  <div
                    className={`fw-bold small ${billPaymentMethod === "CARD" ? "text-purple" : ""}`}
                  >
                    Card
                  </div>
                  <div className="x-small text-secondary">
                    Credit / Debit card
                  </div>
                </div>
                {billPaymentMethod === "CARD" && (
                  <FiCheckCircle
                    className="ms-auto text-purple"
                    size={18}
                  />
                )}
              </button>
              <button
                type="button"
                className={`d-flex align-items-center gap-3 p-3 rounded-4 border flex-fill text-start transition-all ${billPaymentMethod === "CASH" ? "border-warning bg-warning bg-opacity-10" : "border-opacity-20 bg-transparent"}`}
                style={{
                  border: `2px solid ${billPaymentMethod === "CASH" ? "#ffc107" : "rgba(128,128,128,0.2)"}`,
                  transition: "all 0.2s",
                }}
                onClick={() => {
                  setBillPaymentMethod("CASH");
                  setBillTransactionCode("");
                }}
              >
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center ${billPaymentMethod === "CASH" ? "bg-warning" : "bg-secondary bg-opacity-10"}`}
                  style={{ width: 44, height: 44 }}
                >
                  <FiDollarSign
                    size={20}
                    className={
                      billPaymentMethod === "CASH"
                        ? "text-white"
                        : "text-secondary"
                    }
                  />
                </div>
                <div>
                  <div
                    className={`fw-bold small ${billPaymentMethod === "CASH" ? "text-warning" : ""}`}
                  >
                    Cash
                  </div>
                  <div className="x-small text-secondary">
                    Deposit via M-Pesa
                  </div>
                </div>
                {billPaymentMethod === "CASH" && (
                  <FiCheckCircle
                    className="ms-auto text-warning"
                    size={18}
                  />
                )}
              </button>
            </div>

            {billPaymentMethod === "CASH" && (
              <div className="mb-4">
                <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-2">
                  Recipient(Internal)
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-dark border-opacity-20 text-secondary">
                    <FiSmartphone size={16} />
                  </span>
                  <input
                    type="text"
                    className="form-control bg-transparent border-opacity-20"
                    placeholder="e.g. QW12ER34TY56"
                    value={billTransactionCode}
                    onChange={(e) => setBillTransactionCode(e.target.value)}
                  />
                </div>
                <div className="x-small text-secondary mt-1">
                  Internal — M-Pesa code from depositing cash to the business
                  till for reconciliation
                </div>
              </div>
            )}

            {billError && (
              <div className="alert alert-danger py-2 small">{billError}</div>
            )}
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn px-4 py-2 rounded-pill fw-bold text-secondary"
                onClick={() => {
                  setShowBillModal(false);
                  setBillSession(null);
                }}
              >
                CANCEL
              </button>
              <button
                type="button"
                className="btn btn-success px-4 py-2 rounded-pill fw-bold shadow-lg d-flex align-items-center gap-2"
                disabled={billLoading || !billPaymentMethod}
                onClick={handleBillSession}
              >
                {billLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm" />{" "}
                    PROCESSING...
                  </>
                ) : (
                  <>
                    <FiDollarSign size={14} />{" "}
                    {billPaymentMethod === "CASH"
                      ? "RECORD CASH PAYMENT"
                      : "REQUEST PAYMENT"}
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </AdminModal>

      <AdminModal
        isOpen={showCashReceipt}
        onClose={() => {
          setShowCashReceipt(false);
          setCashReceiptData(null);
        }}
        title="Payment Receipt"
        subtitle={
          cashReceiptData ? `CASH - ${cashReceiptData.session_code}` : ""
        }
        isDarkMode={isDarkMode}
        maxWidth="480px"
      >
        {cashReceiptData && <Receipt data={cashReceiptData} />}
      </AdminModal>

      <AdminModal
        isOpen={showPesapalModal}
        onClose={() => {
          if (pesapalIntervalRef.current)
            clearInterval(pesapalIntervalRef.current);
          sessionStorage.removeItem("pesapal_context");
          setShowPesapalModal(false);
          setPesapalUrl("");
          setPesapalSessionId(null);
          setPesapalStatus("");
          setPesapalMessage("");
        }}
        title="Complete Payment"
        subtitle={
          pesapalStatus === "completed"
            ? "Payment successful"
            : "Customer completes payment via secure portal"
        }
        isDarkMode={isDarkMode}
        maxWidth="800px"
      >
        <div>
          {pesapalStatus === "completed" ? (
            <div className="text-center py-5">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-success bg-opacity-10 mb-3"
                style={{ width: 72, height: 72 }}
              >
                <FiCheckCircle
                  size={36}
                  className="text-success"
                />
              </div>
              <h5 className="fw-bold text-success mb-1">Payment Successful</h5>
              <p className="small text-secondary">{pesapalMessage}</p>
            </div>
          ) : pesapalStatus === "failed" ? (
            <div className="text-center py-5">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle bg-danger bg-opacity-10 mb-3"
                style={{ width: 72, height: 72 }}
              >
                <FiAlertCircle
                  size={36}
                  className="text-danger"
                />
              </div>
              <h5 className="fw-bold text-danger mb-1">Payment Failed</h5>
              <p className="small text-secondary mb-3">{pesapalMessage}</p>
              <div className="d-flex gap-2 justify-content-center">
                <button
                  className="btn btn-outline-secondary rounded-pill px-3 py-2"
                  onClick={() => {
                    if (pesapalIntervalRef.current)
                      clearInterval(pesapalIntervalRef.current);
                    setShowPesapalModal(false);
                    setPesapalUrl("");
                    setPesapalSessionId(null);
                    setPesapalStatus("");
                    setPesapalMessage("");
                  }}
                >
                  CLOSE
                </button>
                <button
                  className="btn btn-purple rounded-pill px-3 py-2 fw-bold shadow-lg"
                  onClick={async () => {
                    if (pesapalIntervalRef.current)
                      clearInterval(pesapalIntervalRef.current);

                    const ctx = sessionStorage.getItem("pesapal_context");
                    let prevMethod: "MPESA" | "CARD" | "" = "";
                    if (ctx) {
                      try {
                        const p = JSON.parse(ctx);
                        prevMethod = p.paymentMethod || "";
                      } catch {}
                    }

                    try {
                      const res = await sessionsApi.getById(
                        Number(pesapalSessionId),
                      );
                      const session =
                        res?.data?.data ??
                        res?.data ??
                        sessions.find(
                          (s: any) => Number(s.id) === Number(pesapalSessionId),
                        );
                      if (session) {
                        setBillSession(session);
                        setBillPaymentMethod(
                          prevMethod ||
                            (session.pesapal_payment_method?.toUpperCase() ===
                            "CARD"
                              ? "CARD"
                              : "MPESA"),
                        );
                        setBillError("");
                      }
                    } catch {
                      const session = sessions.find(
                        (s: any) => Number(s.id) === Number(pesapalSessionId),
                      );
                      if (session) {
                        setBillSession(session);
                        setBillPaymentMethod(
                          prevMethod ||
                            (session.pesapal_payment_method?.toUpperCase() ===
                            "CARD"
                              ? "CARD"
                              : "MPESA"),
                        );
                        setBillError("");
                      }
                    }

                    setPesapalUrl("");
                    setPesapalSessionId(null);
                    setPesapalStatus("");
                    setPesapalMessage("");
                    setShowPesapalModal(false);
                    setShowBillModal(true);
                  }}
                >
                  <FiRefreshCw
                    className="me-1"
                    size={13}
                  />{" "}
                  RETRY
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="d-flex align-items-center gap-2 mb-3 p-2 rounded-3 bg-warning bg-opacity-10">
                <div className="spinner-border spinner-border-sm text-warning flex-shrink-0" />
                <span className="small text-secondary">{pesapalMessage}</span>
              </div>
              <div
                className="rounded-3 overflow-hidden border border-opacity-20"
                style={{ height: 600 }}
              >
                <iframe
                  src={pesapalUrl}
                  title="Pesapal Payment"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  onLoad={handlePesapalIframeLoad}
                  allow="payment *"
                />
              </div>
            </>
          )}
        </div>
      </AdminModal>

      <ConfirmModal
        isOpen={confirmAction?.type === "delete_session"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleDeleteSession}
        title="Delete Session"
        message="Are you sure you want to delete this session? All associated service lines will also be removed."
        confirmText="DELETE"
        confirmButtonClassName="btn-danger"
        isDarkMode={isDarkMode}
      />

      <ConfirmModal
        isOpen={confirmAction?.type === "remove_service"}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleRemoveService}
        title="Remove Service"
        message="Are you sure you want to remove this service from the session?"
        confirmText="REMOVE"
        confirmButtonClassName="btn-danger"
        isDarkMode={isDarkMode}
      />

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={successMsg}
        isDarkMode={isDarkMode}
      />

      <style>{`
        .glass-input-simple {
          background: rgba(106, 13, 173, 0.03) !important;
          border: 1px solid rgba(106, 13, 173, 0.1) !important;
          padding: 0.75rem 1rem !important;
          border-radius: 12px !important;
        }
        .glass-input-premium {
          background: transparent !important;
          border: 1px solid rgba(106, 13, 173, 0.15) !important;
          padding: 0.9rem 1rem !important;
          border-radius: 14px !important;
        }
        .btn-purple-outline {
          border: 1px solid #6a0dad;
          color: #6a0dad;
          background: transparent;
        }
        .btn-purple-outline:hover {
          background: #6a0dad;
          color: #fff;
        }
        .text-gradient {
          background: linear-gradient(45deg, #6a0dad, #b026ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .x-small { font-size: 0.65rem; }
        .bg-purple { background-color: #6a0dad; }
        .text-purple { color: #6a0dad; }
        .tracking-wider { letter-spacing: 0.05em; }
        .opacity-50-hover { opacity: 0.4; transition: opacity 0.15s ease; }
        .opacity-50-hover:hover { opacity: 1; }
        .hover-bg-white-10:hover { background: rgba(255,255,255,0.1) !important; }
        .hover-bg-black-10:hover { background: rgba(0,0,0,0.05) !important; }
        .bg-opacity-25 { --bs-bg-opacity: 0.25; }
        .bg-opacity-5 { --bs-bg-opacity: 0.05; }
        .bg-opacity-10 { --bs-bg-opacity: 0.1; }
        .bg-opacity-75 { --bs-bg-opacity: 0.75; }
        .bg-opacity-90 { --bs-bg-opacity: 0.9; }
        .border-opacity-5 { --bs-border-opacity: 0.05; }
        .border-opacity-10 { --bs-border-opacity: 0.1; }
        .border-opacity-20 { --bs-border-opacity: 0.2; }
        .border-purple { border-color: #6a0dad !important; }
        .transition-all { transition: all 0.2s ease; }
      `}</style>
    </AdminLayout>
  );
};

export default SessionsManagementPage;
