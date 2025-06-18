import React, { useEffect, useRef } from "react";

const ClientSearch = ({
  searchTerm,
  setSearchTerm,
  filteredClients,
  handleClientSelect,
  showClientDropdown,
  setShowClientDropdown,
  hightLightedIndex,
  setHighLightedIndex,
  formData,
  setFormData,
  setIsClientModalOpen,
  clientData,
}) => {
  const ref = useRef(null);

  // Add click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowClientDropdown(false);
      }
    };

    // Add when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowClientDropdown]);

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-1">
        اسم العميل <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const val = e.target.value;
            setSearchTerm(val);
            setShowClientDropdown(true);
            setHighLightedIndex(0);
            if (
              val !== formData.clientName ||
              val !== clientData?.phoneNumber
            ) {
              setFormData((prev) => ({
                ...prev,
                clientName: "",
                clientId: "",
              }));
            }
          }}
          onFocus={() => {
            setShowClientDropdown(true);
            if (!searchTerm) {
              setFormData((prev) => ({
                ...prev,
                clientName: "",
                clientId: "",
              }));
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighLightedIndex((prev) =>
                prev < filteredClients.length - 1 ? prev + 1 : 0
              );
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighLightedIndex((prev) =>
                prev > 0 ? prev - 1 : filteredClients.length - 1
              );
            } else if (e.key === "Enter" && showClientDropdown) {
              e.preventDefault();
              if (filteredClients[hightLightedIndex]) {
                handleClientSelect(filteredClients[hightLightedIndex]);
                setShowClientDropdown(false);
              }
            }
          }}
          placeholder="ابحث عن عميل..."
          className="w-full p-3 pr-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
          required
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        </div>
        {searchTerm && (
          <button
            type="button"
            onClick={() => {
              setSearchTerm("");
              setShowClientDropdown(false);
              setFormData((prev) => ({
                ...prev,
                clientName: "",
                clientId: "",
              }));
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {showClientDropdown && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto text-sm">
          {filteredClients.length > 0 ? (
            filteredClients.map((client, index) => (
              <div
                key={client._id}
                onClick={() => {
                  handleClientSelect(client);
                  setShowClientDropdown(false); // Close dropdown when selecting a client
                }}
                className={`flex justify-between items-center px-4 py-3 cursor-pointer ${
                  hightLightedIndex === index
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                } ${
                  index !== filteredClients.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >
                <span className="font-medium text-gray-800">
                  {client.fullname}
                </span>
                <span className="text-gray-500 text-xs bg-gray-100 px-2 py-1 rounded-full">
                  {client.phoneNumber}
                </span>
              </div>
            ))
          ) : (
            <div className="px-4 py-3 text-gray-500 text-center">
              <span className="block">لا توجد نتائج</span>
              <button
                type="button"
                onClick={() => {
                  setIsClientModalOpen(true);
                  setShowClientDropdown(false); // Close dropdown when clicking to create new client
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-flex items-center"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                إنشاء عميل جديد
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientSearch;