import React, { useState, useRef, useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";
import GeneralReportTable from "./Reports/GeneralReportTable";
import io from "socket.io-client";
import { ArrowLeft, ArrowRight } from "lucide-react";

// Constants
const SOCKET_URL = "http://localhost:5000";
const socket = io(SOCKET_URL);

// Utility functions
const formatDate = (dateString) => {
  if (!dateString) return "";
  const d = new Date(dateString);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

const getStatus = (amount, min, max) => {
  if (amount > max) return { status: "HIGH", color: "text-red-600" };
  if (amount < min) return { status: "LOW", color: "text-amber-600" };
  return { status: "MEDIUM", color: "text-green-600" };
};

const MakeReport = () => {
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
  const [selectedFilter, setSelectedFilter] = useState("");
  const reportRef = useRef();

  // Derived values
  const selectedClient = allClients.find(
    (client) => client._id === selectedClientId
  );

  // Calculate totals
  const buyTotalsByCurrency = clientProcesses.reduce((acc, process) => {
    const currency = process.fromCurrency;
    const amount = process.processAmountBuy || 0;
    acc[currency] = (acc[currency] || 0) + amount;
    return acc;
  }, {});

  const sellTotalsByCurrency = clientProcesses.reduce((totals, p) => {
    const currency = p.toCurrency;
    const amount = p.processAmountSell || 0;
    if (!currency) return totals;
    totals[currency] = (totals[currency] || 0) + amount;
    return totals;
  }, {});

  // Effects
  useEffect(() => {
    const fetchAllClients = async () => {
      try {
        const { data } = await axios.get(
          `${backendUrl}/api/employee/get-clients`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (data.success) {
          let filtered = data.clients;

          if (userData) {
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

    if (token) fetchAllClients();
  }, [token, backendUrl, userData]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = allClients.filter(
      (client) =>
        client.fullname.toLowerCase().includes(term) ||
        client.phoneNumber?.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  }, [searchTerm, allClients]);

  useEffect(() => {
    socket.on("process:edited", () => {
      console.log("Received edit:process event");
      fetchClientProcesses();
    });

    return () => {
      socket.off("edit:process");
    };
  }, [startDate, endDate, selectedClientId]);

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
          `${backendUrl}/api/employee/get-processes-for-report`,
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

  const printVoucher = () => {
    if (clientProcesses.length === 0) {
      toast.error("No transactions to print");
      return;
    }

    const voucherWindow = window.open("", "_blank", "width=900,height=600");

    // Calculate totals
    const usdBuyTotal = clientProcesses
      .filter((p) => p.fromCurrency === "USD")
      .reduce((sum, p) => sum + (p.processAmountBuy || 0), 0);

    const usdSellTotal = clientProcesses
      .filter((p) => p.toCurrency === "USD")
      .reduce((sum, p) => sum + (p.processAmountSell || 0), 0);

    const lbpSellTotal = clientProcesses
      .filter((p) => p.toCurrency === "LBP")
      .reduce((sum, p) => sum + (p.processAmountSell || 0), 0);

    const lbpBuyTotal = clientProcesses
      .filter((p) => p.fromCurrency === "LBP")
      .reduce((sum, p) => sum + (p.processAmountBuy || 0), 0);

    // Determine status
    const numericMin = Number(selectedClient?.minimum) || 0;
    const numericMax = Number(selectedClient?.maximum) || Infinity;
    const { status } = getStatus(usdBuyTotal, numericMin, numericMax);

    // Generate voucher HTML
    voucherWindow.document.write(`
      <html>
        <head>
          <title>Transaction Voucher</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
            .header h2 { color: #4f46e5; margin-bottom: 5px; font-size: 24px; }
            .client-info { margin-bottom: 20px; background: #f9fafb; padding: 15px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            th, td { border: 1px solid #e5e7eb; padding: 12px; text-align: center; }
            th { background-color: #4f46e5; color: white; font-weight: 600; }
            .totals { margin-top: 25px; background: #f9fafb; padding: 15px; border-radius: 8px; }
            .footer { margin-top: 30px; text-align: right; color: #6b7280; font-size: 14px; }
            .status-high { color: #ef4444; }
            .status-medium { color: #10b981; }
            .status-low { color: #f59e0b; }
            .total-row { font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>TRANSACTION VOUCHER</h2>
            <p>Date: ${formatDate(new Date())}</p>
          </div>
          
          ${
            selectedClient
              ? `
            <div class="client-info">
              <p><strong>Client:</strong> ${selectedClient.fullname}</p>
              <p><strong>Phone:</strong> ${
                selectedClient.phoneNumber || "N/A"
              }</p>
              <p><strong>Min:</strong> ${selectedClient.minimum}</p>
              <p><strong>Max:</strong> ${selectedClient.maximum}</p>
              <p><strong>Start Date:</strong> ${formatDate(startDate)}</p>
              <p><strong>End Date:</strong> ${formatDate(endDate)}</p>
            </div>
          `
              : ""
          }

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>From</th>
                <th>To</th>
                <th>Buy Amount</th>
                <th>Sell Amount</th>
              </tr>
            </thead>
            <tbody>
              ${clientProcesses
                .map(
                  (p) => `
                <tr>
                  <td>${formatDate(p.processDate)}</td>
                  <td>${p.fromCurrency}</td>
                  <td>${p.toCurrency}</td>
                  <td>${p.processAmountBuy?.toFixed(2) || "0.00"}</td>
                  <td>${p.processAmountSell?.toFixed(2) || "0.00"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>

          <div class="totals">
            <p class="total-row">Total USD Buy: ${usdBuyTotal.toFixed(2)}</p>
            <p class="total-row">Total USD Sell: ${usdSellTotal.toFixed(2)}</p>
            <p class="total-row">Total LBP Sell: ${lbpSellTotal.toFixed(2)}</p>
            <p class="total-row">Total LBP Buy: ${lbpBuyTotal.toFixed(2)}</p>
            ${
              selectedClient
                ? `
              <p class="total-row">Status: <span class="status-${status.toLowerCase()}">${status}</span></p>
            `
                : ""
            }
          </div>

          <div class="footer">
            <p>Generated by: ${
              selectedClient?.employeeId?.username || "System"
            }</p>
            <p>Signature: _________________________</p>
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

  // Components
  const ClientSidebar = () => (
    <div className="w-full lg:w-1/5 ml-5 bg-white rounded-lg shadow p-3 border border-purple-100 transition hover:shadow-md">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-purple-600"
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

        <div className="bg-purple-50 p-3 rounded-md space-y-2">
          <div className="flex gap-2 text-xs">
            {userData?.accessClientLess && (
              <label className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-purple-100 hover:border-purple-300">
                <input
                  type="checkbox"
                  checked={selectedFilter === "less"}
                  onChange={() =>
                    setSelectedFilter((prev) => (prev === "less" ? "" : "less"))
                  }
                  className="accent-purple-600 h-3 w-3"
                />
                <span>أقل من 10000</span>
              </label>
            )}
            {userData?.accessClientGreater && (
              <label className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-purple-100 hover:border-purple-300">
                <input
                  type="checkbox"
                  checked={selectedFilter === "greater"}
                  onChange={() =>
                    setSelectedFilter((prev) =>
                      prev === "greater" ? "" : "greater"
                    )
                  }
                  className="accent-purple-600 h-3 w-3"
                />
                <span>أكثر من 10000</span>
              </label>
            )}
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-2 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-purple-400"
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
            </div>
            <input
              type="text"
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-purple-200 focus:ring-1 focus:ring-purple-300"
            />
          </div>
        </div>

        <div className="max-h-[55vh] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {filteredClients
            .filter((client) => {
              if (
                !userData?.accessClientGreater &&
                client.clientType === "greater than 10000"
              )
                return false;
              if (
                !userData?.accessClientLess &&
                client.clientType === "less than 10000"
              )
                return false;
              if (selectedFilter === "greater")
                return client.clientType === "greater than 10000";
              if (selectedFilter === "less")
                return client.clientType === "less than 10000";
              return true;
            })
            .map((client) => (
              <div
                key={client._id}
                onClick={() => handleClientClick(client._id)}
                className={`p-3 rounded cursor-pointer text-sm transition-all duration-200 ${
                  selectedClientId === client._id
                    ? "bg-purple-100 border border-purple-300 shadow-sm"
                    : "bg-white hover:bg-gray-50 border border-gray-200 hover:border-purple-200"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800 truncate">
                    {client.fullname}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                    {client.clientType === "greater than 10000"
                      ? "أكثر"
                      : "أقل"}
                  </span>
                </div>
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1 text-purple-400"
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
                  {client.phoneNumber || "No phone"}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );

  const DateRangeSelector = () => (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
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
          <p className="text-sm text-gray-500 mt-1">
            Select date range to filter transactions
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-2xl">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border-2 border-blue-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchClientProcesses()}
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg shadow-md hover:from-blue-700 hover:to-purple-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none flex items-center justify-center min-w-[160px]"
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
    </div>
  );

  const ReportSummary = () => {
    if (!selectedClientId || clientProcesses.length === 0) return null;

    const numericMin = Number(selectedClient?.minimum) || 0;
    const numericMax = Number(selectedClient?.maximum) || Infinity;
    const usdAmount = buyTotalsByCurrency.USD || 0;
    const { status, color } = getStatus(usdAmount, numericMin, numericMax);

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
            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full">
              {clientProcesses.length} transactions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
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
                        {currency}
                      </span>
                      <span className="text-sm font-bold">
                        {amount.toFixed(2)}
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
                        {currency}
                      </span>
                      <span className="text-sm font-bold">
                        {total.toFixed(2)}
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-4 rounded-xl border border-blue-100">
              <h4 className="text-sm font-medium text-gray-800 mb-2">
                USD Status
              </h4>
              {buyTotalsByCurrency.USD ? (
                <div>
                  <p className={`text-lg font-bold ${color}`}>
                    {status === "HIGH" && (
                      <svg
                        className="w-5 h-5 inline mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 10l7-7m0 0l7 7m-7-7v18"
                        />
                      </svg>
                    )}
                    {status === "LOW" && (
                      <svg
                        className="w-5 h-5 inline mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 14l-7 7m0 0l-7-7m7 7V3"
                        />
                      </svg>
                    )}
                    {status === "MEDIUM" && (
                      <svg
                        className="w-5 h-5 inline mr-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {status}
                  </p>
                  <div className="mt-2 text-sm text-gray-600">
                    <p>Amount: ${usdAmount.toFixed(2)}</p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No USD transactions</p>
              )}
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
            Print Voucher
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
  // Helper components (define these outside your component or in a separate file)
  const CurrencyBadge = ({ currency, color }) => (
    <span
      className={`text-xs px-2 py-0.5 rounded-full bg-${color}-100 text-${color}-800 dark:bg-${color}-800 dark:text-${color}-200`}
    >
      {currency}
    </span>
  );

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

  const TypeBadge = ({ type }) => (
    <span
      className={`px-2 py-0.5 text-xs rounded-full ${
        type === "Buy"
          ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200"
          : "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200"
      }`}
    >
      {type.toUpperCase()}
    </span>
  );
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 3;

  const totalPages = Math.ceil(clientProcesses.length / rowsPerPage);

  const paginatedProcesses = clientProcesses.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );
  // Reusable Page Button Component
  const PageButton = ({ page, currentPage, onClick }) => (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center text-sm font-medium rounded-md transition-colors ${
        currentPage === page
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600"
      }`}
      aria-current={currentPage === page ? "page" : undefined}
    >
      {page}
    </button>
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
                      <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
                        <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200">
                          {/* Table Header */}
                          <thead className="bg-gradient-to-r from-blue-700 to-purple-700 text-white">
                            <tr>
                              {[
                                { label: "📅 التاريخ", icon: "calendar" },
                                { label: "💱 التحويل", icon: "exchange" },
                                { label: "🟢 شراء", icon: "buy" },
                                { label: "🔴 بيع", icon: "sell" },
                                { label: "📌 النوع", icon: "type" },
                              ].map(({ label }, idx) => (
                                <th
                                  key={idx}
                                  className="px-4 py-3 font-semibold tracking-wide text-xs uppercase"
                                >
                                  {label}
                                </th>
                              ))}
                            </tr>
                          </thead>

                          {/* Table Body */}
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {paginatedProcesses.length === 0 ? (
                              <tr>
                                <td
                                  colSpan={5}
                                  className="text-center py-6 text-gray-500 dark:text-gray-400"
                                >
                                  لا توجد عمليات مسجلة
                                </td>
                              </tr>
                            ) : (
                              paginatedProcesses.map((p) => (
                                <tr
                                  key={p._id}
                                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                  {/* Date */}
                                  <td className="px-3 py-2 text-sm text-gray-900 dark:text-white">
                                    {new Date(p.processDate).toLocaleDateString(
                                      "en-GB"
                                    )}
                                  </td>

                                  {/* Exchange */}
                                  <td className="px-3 py-2">
                                    <div className="flex items-center gap-1">
                                      <CurrencyBadge
                                        currency={p.fromCurrency}
                                        color="blue"
                                      />
                                      <ArrowIcon />
                                      <CurrencyBadge
                                        currency={p.toCurrency}
                                        color="purple"
                                      />
                                    </div>
                                  </td>

                                  {/* Buy/Sell Amounts */}
                                  <td
                                    className={`px-3 py-2 font-medium ${
                                      p.processType === "Buy"
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-gray-600 dark:text-gray-300"
                                    }`}
                                  >
                                    {p.processAmountBuy}
                                  </td>
                                  <td
                                    className={`px-3 py-2 font-medium ${
                                      p.processType === "Sell"
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-gray-600 dark:text-gray-300"
                                    }`}
                                  >
                                    {p.processAmountSell}
                                  </td>

                                  {/* Type */}
                                  <td className="px-3 py-2">
                                    <TypeBadge type={p.processType} />
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                        {/* pagination */}
                        <div className="flex justify-end mr-3 items-center mt-6 gap-1 rtl:space-x-reverse">
                          {/* Previous Button */}
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => Math.max(prev - 1, 1))
                            }
                            disabled={currentPage === 1}
                            className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Previous page"
                          >
                            <ArrowLeft className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>

                          {/* Page Numbers - with ellipsis for large numbers */}
                          {totalPages <= 7 ? (
                            // Show all pages if total is small
                            Array.from({ length: totalPages }, (_, i) => (
                              <PageButton
                                key={i + 1}
                                page={i + 1}
                                currentPage={currentPage}
                                onClick={() => setCurrentPage(i + 1)}
                              />
                            ))
                          ) : (
                            // Show smart pagination with ellipsis for larger counts
                            <>
                              <PageButton
                                page={1}
                                currentPage={currentPage}
                                onClick={() => setCurrentPage(1)}
                              />

                              {currentPage > 3 && (
                                <span className="px-2 text-gray-500">...</span>
                              )}

                              {[
                                currentPage - 1,
                                currentPage,
                                currentPage + 1,
                              ].map(
                                (page) =>
                                  page > 1 &&
                                  page < totalPages && (
                                    <PageButton
                                      key={page}
                                      page={page}
                                      currentPage={currentPage}
                                      onClick={() => setCurrentPage(page)}
                                    />
                                  )
                              )}

                              {currentPage < totalPages - 2 && (
                                <span className="px-2 text-gray-500">...</span>
                              )}

                              <PageButton
                                page={totalPages}
                                currentPage={currentPage}
                                onClick={() => setCurrentPage(totalPages)}
                              />
                            </>
                          )}

                          {/* Next Button */}
                          <button
                            onClick={() =>
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-md bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            aria-label="Next page"
                          >
                            <ArrowRight className="w-4 h-4 text-gray-700 dark:text-gray-300" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <GeneralReportTable
                        generalProcesses={clientProcesses}
                        allClients={allClients}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    )}
                  </div>
                  <ReportSummary />
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

export default MakeReport;
