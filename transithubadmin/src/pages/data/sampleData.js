// Sample Data for weekly performance, remove if naa nay backend
export const weeklyData = [
    { name: "Mon", deliveries: 10, sales: 7000 },
    { name: "Tue", deliveries: 12, sales: 8500 },
    { name: "Wed", deliveries: 14, sales: 6000 },
    { name: "Thu", deliveries: 15, sales: 7200 },
    { name: "Fri", deliveries: 11, sales: 9000 },
    { name: "Sat", deliveries: 9, sales: 9500 },
    { name: "Sun", deliveries: 8, sales: 5300 }
];


export const userData = [
    { firstName: "John", lastName: "Doe", email: "john.doe@example.com", dateCreated: "2024-01-15", userType: "Owner", password: "password123" },
    { firstName: "Jane", lastName: "Smith", email: "jane.smith@example.com", dateCreated: "2024-02-20", userType: "Operator", password: "password456" },
    { firstName: "Emily", lastName: "Johnson", email: "emily.johnson@example.com", dateCreated: "2024-03-25", userType: "Operator", password: "password789" },
    { firstName: "Michael", lastName: "Williams", email: "michael.williams@example.com", dateCreated: "2024-04-10", userType: "Owner", password: "password101" },
    { firstName: "Delwin", lastName: "Gauson", email: "delwingauson@example.com", dateCreated: "2024-09-08", userType: "Owner", password: "password202" },
    { firstName: "Sophia", lastName: "Brown", email: "sophia.brown@example.com", dateCreated: "2024-08-12", userType: "Operator", password: "password303" },
    { firstName: "James", lastName: "Miller", email: "james.miller@example.com", dateCreated: "2024-07-30", userType: "Owner", password: "password404" },
    { firstName: "Olivia", lastName: "Davis", email: "olivia.davis@example.com", dateCreated: "2024-09-05", userType: "Operator", password: "password505" },
    { firstName: "William", lastName: "Garcia", email: "william.garcia@example.com", dateCreated: "2024-06-15", userType: "Owner", password: "password606" },
    { firstName: "Ava", lastName: "Martinez", email: "ava.martinez@example.com", dateCreated: "2024-05-01", userType: "Operator", password: "password707" },
    { firstName: "Liam", lastName: "Rodriguez", email: "liam.rodriguez@example.com", dateCreated: "2024-04-18", userType: "Owner", password: "password808" },
    { firstName: "Mia", lastName: "Lopez", email: "mia.lopez@example.com", dateCreated: "2024-08-23", userType: "Operator", password: "password909" },
    { firstName: "Benjamin", lastName: "Hernandez", email: "benjamin.hernandez@example.com", dateCreated: "2024-07-12", userType: "Owner", password: "password010" },
    { firstName: "Isabella", lastName: "Gonzalez", email: "isabella.gonzalez@example.com", dateCreated: "2024-09-01", userType: "Operator", password: "password121" },
    { firstName: "Elijah", lastName: "Wilson", email: "elijah.wilson@example.com", dateCreated: "2024-08-28", userType: "Owner", password: "password232" },
    { firstName: "Charlotte", lastName: "Anderson", email: "charlotte.anderson@example.com", dateCreated: "2024-07-03", userType: "Operator", password: "password343" },
    { firstName: "Lucas", lastName: "Thomas", email: "lucas.thomas@example.com", dateCreated: "2024-09-06", userType: "Owner", password: "password454" },
    { firstName: "Amelia", lastName: "Taylor", email: "amelia.taylor@example.com", dateCreated: "2024-05-15", userType: "Operator", password: "password565" },
    { firstName: "Henry", lastName: "Moore", email: "henry.moore@example.com", dateCreated: "2024-06-25", userType: "Owner", password: "password676" },
    { firstName: "Evelyn", lastName: "Jackson", email: "evelyn.jackson@example.com", dateCreated: "2024-07-22", userType: "Operator", password: "password787" },
    { firstName: "Alexander", lastName: "White", email: "alexander.white@example.com", dateCreated: "2024-08-18", userType: "Owner", password: "password898" },
    { firstName: "Scarlett", lastName: "Harris", email: "scarlett.harris@example.com", dateCreated: "2024-09-07", userType: "Operator", password: "password909" },
    { firstName: "Jack", lastName: "Clark", email: "jack.clark@example.com", dateCreated: "2024-06-02", userType: "Owner", password: "password020" },
    { firstName: "Grace", lastName: "Lewis", email: "grace.lewis@example.com", dateCreated: "2024-08-31", userType: "Operator", password: "password131" },
];

export const deliveryRate = [
    {
        toLocation: "Ace Medical Center, City of Cebu, CB, Philippines",
        fromLocation: "Wash n Dry, City of Cebu, CB, Philippines",
        status: "Arrived",
        dateCreated: "2024-09-01 23:45:39",
        operator: "Isabella Gonzalez",
        owner: "Delwin Gauson"
    },
    {
        toLocation: "SM City Cebu, City of Cebu, CB, Philippines",
        fromLocation: "Ayala Center Cebu, City of Cebu, CB, Philippines",
        status: "Cancelled",
        dateCreated: "2024-09-02 10:15:22",
        operator: "Scarlett Harris",
        owner: "Jack Clark"
    },
    {
        toLocation: "Cebu IT Park, City of Cebu, CB, Philippines",
        fromLocation: "Cebu Business Park, City of Cebu, CB, Philippines",
        status: "Arrived",
        dateCreated: "2024-09-03 14:20:05",
        operator: "Grace Lewis",
        owner: "Alexander White"
    },
    {
        toLocation: "University of Cebu, City of Cebu, CB, Philippines",
        fromLocation: "Cebu Doctors' University, City of Cebu, CB, Philippines",
        status: "Cancelled",
        dateCreated: "2024-09-04 09:30:18",
        operator: "Evelyn Jackson",
        owner: "Benjamin Hernandez"
    },
    {
        toLocation: "Cebu South Road Properties, City of Cebu, CB, Philippines",
        fromLocation: "Cebu North Bus Terminal, City of Cebu, CB, Philippines",
        status: "Arrived",
        dateCreated: "2024-09-05 16:45:37",
        operator: "Amelia Taylor",
        owner: "Lucas Thomas"
    },
    {
        toLocation: "Robinsons Galleria Cebu, City of Cebu, CB, Philippines",
        fromLocation: "SM Seaside City Cebu, City of Cebu, CB, Philippines",
        status: "Cancelled",
        dateCreated: "2024-09-06 11:05:22",
        operator: "Olivia Davis",
        owner: "William Garcia"
    },
    {
        toLocation: "Cebu Technological University, City of Cebu, CB, Philippines",
        fromLocation: "Cebu International Convention Center, City of Cebu, CB, Philippines",
        status: "Arrived",
        dateCreated: "2024-09-07 13:25:40",
        operator: "Sophia Brown",
        owner: "Michael Williams"
    }
];
