MODEL = {
    CUSTOMER: 'Customer',
    CAR: {
        BRAND: 'Car_Brand',
        CATEGORY: 'Car_Category',
        MODEL: 'Car_Model',
        FUEL: 'Fuel_Type',
        REGISTRATION: 'Registration_Type',
        TRANSMISSION: 'Transmission_Type',
        CAR: 'Car'
    },
    CLUSTER: {
        CLUSTER: 'Cluster',
        REQUESTER_ROLE: 'Requester_Role',
        REQUEST: 'Cluster_Request'
    },
    CLEANER: 'Cleaner',
    TIPS:'Tips',
    SUPERVISOR: 'Supervisor',
    ADMIN: 'Admin',
    RESIDENCE: 'Residence_Type',
    QRCODE_SERIES: 'QrCode_Series',
    QRCODE: 'QrCode',
    CUSTOMER_CAR: "Customer_Car",
    PACKAGE: 'Package',
    SUBSCRIPTION: 'Subscription',
    HOLIDAY: {
        NATIONAL: "National_Holiday",
        LOCAL: "Local_Holiday"
    },
    SCHEDULE: "Schedule",
    CHANGE_ADDRESS_REQUEST: "Change_Address_Request",
    REFRESH_TOKEN: "Refresh_Token",
    DISCOUNT: "Discount",
    TIME_SLOT: 'Time_Slot',
    TRANSACTION: "Transaction"
}


ID_PREFIX = {
    CUSTOMER: 'Cs_',
    CAR: {
        CAR: 'Ca_',
        MODEL: 'Cm_',
        BRAND: 'Cb_',
        CATEGORY: 'Cc_',
    },
    CLEANER: 'Cl_',
    SUPERVISOR: 'Su_',
    ADMIN: 'Ad_',
    CLUSTER: {
        CLUSTER: 'Clu_',
        REQUEST: 'Cq_',
    },
    QRCODE_SERIES: 'Qrs_',
    CUSTOMER_CAR: 'Car_',
    PACKAGE: 'Pk_',
    SUBSCRIPTION: 'Sb_',
    SCHEDULE: "Sch_",
    CHANGE_ADDRESS_REQUEST: "Chr_",
    DISCOUNT: 'Dis_',
    TRANSACTION: 'Tra_'
}

ROLE = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    CLEANER: 'cleaner',
    SUPERVISOR: 'supervisor'
}


CONSTANT = {
    ID_PREFIX,
    MODEL,
    ROLE
}

module.exports = CONSTANT