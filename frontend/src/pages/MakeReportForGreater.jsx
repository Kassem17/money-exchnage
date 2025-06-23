import React, { useState, useRef, useContext, useEffect, useMemo } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import GeneralReportTable from "./Reports/GeneralReportTable";
import io from "socket.io-client";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatWithCommas } from "../utils/formatWithComma";
import { formatDate } from "../utils/formatDate";

// Constants
const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL);

const getStatus = (amount, min, max) => {
  if (amount > max) return { status: "HIGH", color: "text-red-600" };
  if (amount < min) return { status: "LOW", color: "text-amber-600" };
  return { status: "MEDIUM", color: "text-green-600" };
};

const normalizeCurrency = (currency) => {
  return currency === "دولار أمريكي" ? "USD" : currency;
};

const MakeReportForGreater = () => {
  // Context and state
  const { backendUrl, token, userData } = useContext(AppContext);
  const [allClients, setAllClients] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClientId, setSelectedClientId] = useState(null);
  const [clientProcesses, setClientProcesses] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("greater");
  const reportRef = useRef();
  const [currencies, setCurrencies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  // Derived values
  const selectedClient = allClients.find(
    (client) => client._id === selectedClientId
  );
  const totalPages = Math.ceil(clientProcesses.length / rowsPerPage);
  const paginatedProcesses = clientProcesses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Calculate totals - combining USD and "دولار أمريكي"
  const calculateTotals = () => {
    const totals = {
      buy: {},
      sell: {},
      totalUSD: 0,
    };

    clientProcesses.forEach((process) => {
      // Handle buy amounts
      const buyCurrency = normalizeCurrency(process.fromCurrency);
      const buyAmount = process.processAmountBuy || 0;
      totals.buy[buyCurrency] = (totals.buy[buyCurrency] || 0) + buyAmount;

      // Handle sell amounts
      const sellCurrency = normalizeCurrency(process.toCurrency);
      const sellAmount = process.processAmountSell || 0;
      if (sellCurrency) {
        totals.sell[sellCurrency] =
          (totals.sell[sellCurrency] || 0) + sellAmount;
      }

      // Calculate total USD (both buy and sell)
      if (buyCurrency === "USD") {
        totals.totalUSD += buyAmount;
      }
      if (sellCurrency === "USD") {
        totals.totalUSD += sellAmount;
      }
    });

    return totals;
  };

  const {
    buy: buyTotalsByCurrency,
    sell: sellTotalsByCurrency,
    totalUSD,
  } = calculateTotals();

  // Effects
  useEffect(() => {
    const fetchAllClients = async () => {
      try {
        if (!token || !userData) return;

        const { data } = await axios.get(
          `${backendUrl}/api/employee/get-clients`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          let filtered = data.clients;

          if (!userData.accessClientGreater) {
            filtered = filtered.filter(
              (client) => client.clientType !== "greater than 10000"
            );
          }
          if (!userData.accessClientLess) {
            filtered = filtered.filter(
              (client) => client.clientType !== "less than 10000"
            );
          }

          setAllClients(filtered);
          setFilteredClients(filtered);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.error("Error fetching clients:", error.message);
      }
    };

    fetchAllClients();
  }, [token, backendUrl, userData]);
  const fetchClientProcesses = async (clientId = selectedClientId) => {
    if (!startDate || !endDate) {
      toast.error("Select a date range first");
      return;
    }

    setLoading(true);

    try {
      let response;

      if (clientId) {
        response = await axios.post(
          `${backendUrl}/api/employee/get-processes-for-report-greater`,
          { clientId, startDate, endDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        response = await axios.post(
          `${backendUrl}/api/employee/get-processes`,
          { startDate, endDate },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      const data = response.data;

      if (data.success) {
        setClientProcesses(data.processes);
        setCurrentPage(1); // Reset to first page when new data loads
        if (data.processes.length === 0) {
          toast.info("No transactions found for this selection.");
        } else {
          toast.success("Processes loaded");
        }
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Filter clients based on search term and selected filter
    const filtered = allClients.filter((client) => {
      const matchesSearch =
        client.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (client.phoneNumber && client.phoneNumber.includes(searchTerm));

      return matchesSearch;
    });

    setFilteredClients(filtered);
  }, [searchTerm, allClients]); // Added missing dependencies

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        const { data } = await axios.get(
          backendUrl + "/api/employee/get-currency"
        );
        if (data.success) {
          setCurrencies(data.currencies);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        console.log(error.message);
      }
    };
    fetchCurrencies();
  }, [backendUrl]);

  useEffect(() => {
    const handleProcessEdited = () => {
      console.log("Received process:edited event");
      fetchClientProcesses();
    };

    socket.on("process:edited", handleProcessEdited);

    return () => {
      socket.off("process:edited", handleProcessEdited);
    };
  }, [startDate, endDate, selectedClientId, fetchClientProcesses]); // Added fetchClientProcesses to dependencies

  // Handlers
  const handleClientClick = (clientId) => {
    if (selectedClientId === clientId) {
      setSelectedClientId(null);
      setClientProcesses([]);
    } else {
      setSelectedClientId(clientId);
      setClientProcesses([]);
      if (startDate && endDate) {
        fetchClientProcesses(clientId);
      }
    }
  };

  const getCurrencyName = (currencyCode, currencies) => {
    if (!currencyCode || !currencies) return currencyCode || "";
    const currency = currencies.find((c) => c.code === currencyCode);
    return currency ? currency.name : currencyCode;
  };

  const printVoucher = () => {
    if (clientProcesses.length === 0) {
      toast.error("No transactions to print");
      return;
    }

    const voucherWindow = window.open("", "_blank", "width=900,height=600");

    const usdBuyTotal = clientProcesses
      .filter((p) => normalizeCurrency(p.fromCurrency) === "USD")
      .reduce((sum, p) => sum + (p.processAmountBuy || 0), 0);

    const usdSellTotal = clientProcesses
      .filter((p) => normalizeCurrency(p.toCurrency) === "USD")
      .reduce((sum, p) => sum + (p.processAmountSell || 0), 0);

    const buyTotalsByCurrency = {};
    const sellTotalsByCurrency = {};

    clientProcesses.forEach((p) => {
      const buyCur = normalizeCurrency(p.fromCurrency);
      const sellCur = normalizeCurrency(p.toCurrency);
      buyTotalsByCurrency[buyCur] =
        (buyTotalsByCurrency[buyCur] || 0) + (p.processAmountBuy || 0);
      sellTotalsByCurrency[sellCur] =
        (sellTotalsByCurrency[sellCur] || 0) + (p.processAmountSell || 0);
    });

    const numericMin = Number(selectedClient?.minimum) || 0;
    const numericMax = Number(selectedClient?.maximum) || Infinity;
    const { status } = getStatus(
      usdBuyTotal + usdSellTotal,
      numericMin,
      numericMax
    );

    voucherWindow.document.write(`
    <html>
      <head>
      <title>${selectedClient.fullname} - تقرير  المعاملات </title>
        <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700&family=Roboto:wght@300;400;500&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4;
            margin: 10mm;
          }
          body {
            font-family: 'Roboto', 'Tajawal', sans-serif;
            font-size: 11pt;
            margin: 0;
            padding: 0;
            line-height: 1.4;
            direction: rtl;
            color: #333;
          }
          .report-container {
            width: 100%;
            padding: 10mm;
            box-sizing: border-box;
          }
          .report-header,
          .report-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .report-title {
            font-size: 18pt;
            font-weight: bold;
            color: #4f46e5;
            margin: 0;
          }
          .report-subtitle {
            font-size: 11pt;
            color: #555;
            margin: 0;
          }
          .report-date {
            font-size: 10pt;
            color: #777;
          }
          .client-section,
          .summary-card {
            border: 1px solid #ccc;
            border-radius: 4px;
            padding: 8px;
            margin-top: 12px;
            background: #f9f9f9;
          }
          .section-title {
            font-size: 13pt;
            color: #4f46e5;
            border-bottom: 1px solid #ddd;
            margin-bottom: 8px;
          }
          .client-details {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
          }
          .detail-item {
            min-width: 130px;
            font-size: 10pt;
          }
          .detail-label {
            font-weight: 600;
            color: #444;
          }
          .transactions-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 8pt;
            margin-top: 12px;
          }
          .transactions-table th,
          .transactions-table td {
            border: 1px solid #ccc;
            padding: 4px 6px;
            text-align: center;
          }
          .transactions-table th {
            background: #4f46e5;
            color: white;
          }
          .transactions-table tr:nth-child(even) {
            background: #f2f2f2;
          }
          .summary-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-top: 10px;
          }
          .summary-card-title {
            font-weight: bold;
            color: #4f46e5;
            font-size: 11pt;
            margin-bottom: 5px;
          }
          .summary-item {
            display: flex;
            justify-content: space-between;
            font-size: 10pt;
          }
          .risk-indicator {
            padding: 2px 6px;
            font-size: 9pt;
            border-radius: 4px;
            font-weight: bold;
          }
          .high-risk { background: #fee2e2; color: #b91c1c; }
          .medium-risk { background: #dcfce7; color: #15803d; }
          .low-risk { background: #fef3c7; color: #b45309; }
          .signature-block {
            width: 180px;
            text-align: center;
          }
          .signature-line {
            margin: 20px 0 5px;
            border-top: 1px solid #333;
          }
          @media print {
            .report-container {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="report-container">
          <div class="report-header">
            <div>
              <h1 class="report-title">تقرير العمليات المالية</h1>
              <p class="report-subtitle">كشف تفصيلي لحركة المعاملات</p>
            </div>
            <div>
              <p class="report-date">${formatDate(new Date())}</p>
            </div>
          </div>

          ${
            selectedClient
              ? `
          <div class="client-section">
            <h3 class="section-title">معلومات العميل</h3>
            <div class="client-details">
              <div class="detail-item"><span class="detail-label">الاسم:</span> ${
                selectedClient.fullname
              }</div>
              <div class="detail-item"><span class="detail-label">النوع:</span> ${
                selectedClient.clientType === "greater than 10000"
                  ? "أكثر من 10000"
                  : "أقل من 10000"
              }</div>
              <div class="detail-item"><span class="detail-label">الهاتف:</span> ${
                selectedClient.phoneNumber || "غير متوفر"
              }</div>
              <div class="detail-item"><span class="detail-label">الفترة:</span> ${formatDate(
                startDate
              )} - ${formatDate(endDate)}</div>
            </div>
          </div>
          `
              : ""
          }

          <h3 class="section-title">كشف المعاملات</h3>
          <table class="transactions-table">
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>من</th>
                <th>إلى</th>
                                <th>من -> إلى</th>

                <th>المسار</th>
                <th>النوع</th>

              </tr>
            </thead>
            <tbody>
              ${clientProcesses
                .map(
                  (p) => `
                <tr>
                  <td>${formatDate(p.processDate)}</td>
                  <td>${getCurrencyName(p.fromCurrency, currencies)}</td>
                  <td>${getCurrencyName(p.toCurrency, currencies)}</td>
                  <td>${
                    formatWithCommas(p.processAmountBuy?.toFixed(2)) || "0.00"
                  } -> ${
                    formatWithCommas(p.processAmountSell?.toFixed(2)) || "0.00"
                  }</td>
                  <td>${p.moneySource} -> ${p.moneyDestination}</td>
                                    <td>${
                                      p.processType === "Buy" ? "شراء" : "بيع"
                                    }</td>

                </tr>`
                )
                .join("")}
            </tbody>
          </table>

          <div class="summary-section">
            <h3 class="section-title">الملخص</h3>
            <div class="summary-grid">
              <div class="summary-card">
                <div class="summary-card-title">إجماليات الشراء</div>
                ${Object.entries(buyTotalsByCurrency)
                  .map(
                    ([cur, amt]) => `
                  <div class="summary-item">
                    <span>${getCurrencyName(cur, currencies)}:</span>
                     <span>${formatWithCommas(amt.toFixed(2))}</span>
                  </div>`
                  )
                  .join("")}
              </div>
              <div class="summary-card">
                <div class="summary-card-title">إجماليات البيع</div>
                ${Object.entries(sellTotalsByCurrency)
                  .map(
                    ([cur, amt]) => `
                  <div class="summary-item">
                    <span>${getCurrencyName(cur, currencies)}:</span>
                     <span>${formatWithCommas(amt.toFixed(2))}</span>
                  </div>`
                  )
                  .join("")}
              </div>
              <div class="summary-card">
                <div class="summary-card-title">إجمالي بالدولار</div>
                <div class="summary-item"><span>الإجمالي:</span><span>${formatWithCommas(
                  (usdBuyTotal + usdSellTotal).toFixed(2)
                )}</span></div>
               
              </div>
            </div>
          </div>

          <div class="report-footer">
            <div>
              <p>أُنشئ بواسطة: ${
                selectedClient?.employeeId?.username || "النظام"
              }</p>
              <p>تاريخ الإنشاء: ${formatDate(new Date())}</p>
            </div>
            <div class="signature-block">
              <div class="signature-line"></div>
              <p>التوقيع</p>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
              window.close();
            }, 200);
          }
        </script>
      </body>
    </html>
  `);

    voucherWindow.document.close();
  };

  // Helper components
  const CurrencyBadge = ({ currency, color, currencies }) => {
    const currencyName = getCurrencyName(currency, currencies);
    return (
      <span
        className={`text-xs px-2 py-0.5 rounded-full bg-${color}-100 text-${color}-800`}
      >
        {currencyName}
      </span>
    );
  };

  const ArrowIcon = () => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-3.5 w-3.5 text-gray-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 5l7 7-7 7M5 5l7 7-7 7"
      />
    </svg>
  );

  const TypeBadge = ({ type }) => {
    const typeText = type === "Buy" ? "شراء" : "بيع";
    const bgColor =
      type === "Buy"
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800";

    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${bgColor}`}>
        {typeText}
      </span>
    );
  };

  const PageButton = ({ page, currentPage, onClick }) => (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
        currentPage === page
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
      }`}
      aria-current={currentPage === page ? "page" : undefined}
    >
      {page}
    </button>
  );

  // Main components
  const ClientSidebar = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const searchInputRef = useRef(null);

    useEffect(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [searchTerm]);

    const filteredClients = useMemo(() => {
      return allClients.filter((client) => {
        const search = searchTerm.toLowerCase();
        return (
          client.fullname.toLowerCase().includes(search) ||
          (client.phoneNumber &&
            client.phoneNumber.toLowerCase().includes(search))
        );
      });
    }, [searchTerm, allClients]);

    return (
      <aside className="w-full lg:w-1/5 ml-0 lg:ml-5 bg-white rounded-2xl shadow-lg border border-purple-100 p-5 flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
            <svg
              className="h-5 w-5 text-purple-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0zM21 10a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            قائمة العملاء
          </h3>
          {selectedClientId && (
            <button
              onClick={() => handleClientClick(selectedClientId)}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Search Box */}
        <div className="bg-purple-50 p-3 rounded-lg shadow-inner mb-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-purple-400">
              <svg
                className="h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
            <input
              ref={searchInputRef}
              type="text"
              placeholder="بحث عن اسم أو رقم..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-purple-200 focus:ring-2 focus:ring-purple-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Clients List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <div
                key={client._id}
                onClick={() => handleClientClick(client._id)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border shadow-sm ${
                  selectedClientId === client._id
                    ? "bg-purple-100 border-purple-300 ring-1 ring-purple-200"
                    : "bg-white hover:bg-gray-50 border-gray-200 hover:border-purple-200"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-800 truncate">
                    {client.fullname}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {client.clientType === "greater than 10000"
                      ? "أكثر"
                      : "أقل"}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <svg
                    className="h-3.5 w-3.5 mr-1 text-purple-400"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28l1.5 4.5-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26 4.5 1.5V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  {client.phoneNumber || "لا يوجد رقم"}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              لا يوجد عملاء مطابقين
            </div>
          )}
        </div>
      </aside>
    );
  };

  const DateRangeSelector = () => {
    const [error, setError] = useState("");
    useEffect(() => {
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        setError("Start date cannot be after end date.");
      } else {
        setError("");
      }
    }, [startDate, endDate]);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Title & Description */}
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center mb-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              Transaction Period
            </h3>
            <p className="text-sm text-gray-500">
              Select a start and end date to filter transactions.
            </p>
          </div>

          {/* Date Inputs and Button */}
          <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl w-full">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 transition-all focus:outline-none ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className={`w-full px-4 py-2 rounded-lg border-2 transition-all focus:outline-none ${
                  error
                    ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                    : "border-blue-100 focus:border-blue-500 focus:ring-blue-100"
                }`}
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => fetchClientProcesses()}
                disabled={loading || !startDate || !endDate || !!error}
                className="min-w-[160px] px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 text-red-600 text-sm font-medium flex items-center">
            <svg
              className="w-4 h-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 3h2m-1 0v2m-1 7h2m-2 0a2 2 0 100 4h2a2 2 0 100-4m0 0v-2m0 0V9"
              />
            </svg>
            {error}
          </div>
        )}
      </div>
    );
  };

  const ReportSummary = () => {
    if (clientProcesses.length === 0) return null;

    const numericMin = selectedClient ? Number(selectedClient.minimum) || 0 : 0;
    const numericMax = selectedClient
      ? Number(selectedClient.maximum) || Infinity
      : Infinity;
    const { status, color } = getStatus(totalUSD, numericMin, numericMax);

    return (
      <div className="mt-8 p-6 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Transaction Summary
            </h2>
            <span
              className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full"
              dir="rtl"
            >
              {clientProcesses.length}{" "}
              {clientProcesses.length > 1 ? "عمليات" : "عملية"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Total Buy
              </h4>
              <div className="space-y-1">
                {Object.entries(buyTotalsByCurrency).map(
                  ([currency, amount]) => (
                    <div
                      key={currency}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm font-medium text-blue-600">
                        {getCurrencyName(currency, currencies)}
                      </span>
                      <span className="text-sm font-bold">
                        {formatWithCommas(amount.toFixed(2))}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
              <h4 className="text-sm font-medium text-purple-800 mb-2">
                Total Sell
              </h4>
              <div className="space-y-1">
                {Object.entries(sellTotalsByCurrency).map(
                  ([currency, total]) => (
                    <div
                      key={currency}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm font-medium text-purple-600">
                        {getCurrencyName(currency, currencies)}
                      </span>
                      <span className="text-sm font-bold">
                        {formatWithCommas(total.toFixed(2))}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <button
            onClick={printVoucher}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg shadow-md transition-all transform hover:scale-[1.01] flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              />
            </svg>
            طباعة
          </button>
        </div>
      </div>
    );
  };

  const EmptyState = () => (
    <div className="text-center py-16">
      <div className="mx-auto w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 text-blue-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-800">
        {selectedClientId
          ? "No transactions found"
          : "No report data available"}
      </h3>
      <p className="mt-2 text-gray-500 max-w-md mx-auto">
        {selectedClientId
          ? "This client has no transactions in the selected date range. Try adjusting the dates."
          : "Select a client and date range to generate a transaction report."}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen -mt-9 -ml-8">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-0.5">
          <ClientSidebar />

          <div className="flex-1">
            <DateRangeSelector />

            <div
              ref={reportRef}
              className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
            >
              {paginatedProcesses.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    {selectedClientId ? (
                      // Enhanced and clean Transaction Table component
                      // Clean modern alternate design for Transaction Table
                      <section className="overflow-hidden rounded-xl border border-gray-200 shadow-lg bg-white">
                        <div className="overflow-x-auto">
                          <table
                            className="min-w-full divide-y divide-gray-200 text-sm text-gray-700 text-center"
                            role="grid"
                            aria-label="تفاصيل العمليات"
                          >
                            <thead className="bg-gray-50">
                              <tr>
                                {[
                                  "التاريخ",
                                  "التحويل",
                                  "إلى → من",
                                  "نوع العملية",
                                ].map((label, index) => (
                                  <th
                                    key={index}
                                    className="px-4 py-3 text-xs font-semibold tracking-wider text-gray-600 uppercase border-b"
                                  >
                                    {label}
                                  </th>
                                ))}
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                              {paginatedProcesses.map((p) => (
                                <tr
                                  key={p._id}
                                  className="hover:bg-indigo-50 transition-colors cursor-pointer group"
                                >
                                  {/* Date */}
                                  <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                                    {new Date(p.processDate).toLocaleDateString(
                                      "ar-EG"
                                    )}
                                  </td>

                                  {/* Exchange */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="flex items-center justify-center gap-1">
                                      <CurrencyBadge
                                        currency={p.fromCurrency}
                                        color="indigo"
                                        currencies={currencies}
                                      />
                                      <span className="text-gray-400">→</span>
                                      <CurrencyBadge
                                        currency={p.toCurrency}
                                        color="purple"
                                        currencies={currencies}
                                      />
                                    </div>
                                  </td>

                                  {/* Buy -> Sell */}
                                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                                    <div className="inline-flex items-center gap-1">
                                      <span>
                                        {formatWithCommas(p.processAmountBuy)}
                                      </span>
                                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                                      <span>
                                        {formatWithCommas(p.processAmountSell)}
                                      </span>
                                    </div>
                                  </td>

                                  {/* Type */}
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <TypeBadge type={p.processType} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
                        <div className="flex flex-wrap justify-between items-center px-4 py-3 bg-gray-50 border-t border-gray-200">
                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.max(p - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            السابق
                          </button>

                          <div className="flex items-center gap-1">
                            {Array.from({ length: totalPages }, (_, i) => (
                              <button
                                key={i + 1}
                                onClick={() => setCurrentPage(i + 1)}
                                className={`px-2 py-1 text-sm rounded ${
                                  currentPage === i + 1
                                    ? "bg-indigo-600 text-white"
                                    : "bg-white text-indigo-700 border border-gray-300 hover:bg-gray-100"
                                }`}
                              >
                                {i + 1}
                              </button>
                            ))}
                          </div>

                          <button
                            onClick={() =>
                              setCurrentPage((p) => Math.min(p + 1, totalPages))
                            }
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
                          >
                            التالي
                          </button>
                        </div>
                      </section>
                    ) : (
                      <GeneralReportTable
                        generalProcesses={clientProcesses}
                        allClients={allClients}
                        startDate={startDate}
                        endDate={endDate}
                        selectedFilter={selectedFilter}
                      />
                    )}
                  </div>
                  {selectedClient && (
                    <ReportSummary
                      clientProcesses={clientProcesses}
                      buyTotalsByCurrency={buyTotalsByCurrency}
                      sellTotalsByCurrency={sellTotalsByCurrency}
                      totalUSD={totalUSD}
                      selectedClient={selectedClient}
                      currencies={currencies}
                    />
                  )}
                </>
              ) : (
                <EmptyState />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MakeReportForGreater;
