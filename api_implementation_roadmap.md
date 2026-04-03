# Kandi API Implementation Roadmap

This document outlines the required API endpoints and implementation steps for the **Customer** and **Rider** modules of the Kandi application.

## 1. Customer API Module (`/api/customer`)
Focus: Ride booking, tracking, and profile management.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/customer/auth/register` | `POST` | Register a new customer account. |
| `/api/customer/auth/login` | `POST` | Authenticate customer and return JWT. |
| `/api/customer/profile` | `GET` | Fetch personal details, active rides, and stats. |
| `/api/customer/profile` | `PUT` | Update customer phone, email, or address. |
| `/api/customer/ride/estimate` | `POST` | Get fare estimate based on pickup and drop coordinates. |
| `/api/customer/ride/request` | `POST` | Create a new ride request (`Order` status set to `Pending`). |
| `/api/customer/ride/status/[id]` | `GET` | Get real-time status and rider location for a specific ride. |
| `/api/customer/ride/cancel/[id]` | `POST` | Cancel a ride request before it is completed. |
| `/api/customer/ride/rate`        | `POST` | Submit rating and feedback for a completed ride. |
| `/api/customer/history` | `GET` | List all past rides with dates and fares. |

---

## 2. Rider API Module (`/api/rider-app`)
Focus: Accepting jobs, navigation, and location sync.

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/rider-app/auth/login` | `POST` | Authenticate rider and return session. |
| `/api/rider-app/profile` | `GET` | Fetch rider details, current vehicle, and performance. |
| `/api/rider-app/status` | `PATCH` | Update availability status (Online/Offline). |
| `/api/rider-app/requests/available`| `GET` | List pending ride requests in the rider's vicinity. |
| `/api/rider-app/ride/accept` | `POST` | Accept a specific `Order` and link it to the rider. |
| `/api/rider-app/ride/arrive` | `POST` | Notify the customer that the rider has reached pickup. |
| `/api/rider-app/ride/start` | `POST` | Start the trip (requires OTP verification). |
| `/api/rider-app/ride/complete` | `POST` | End trip, update vehicle battery, and calculate final fare. |
| `/api/rider-app/location/sync` | `POST` | Periodic update of GPS coordinates (`lastLat`, `lastLng`). |
| `/api/rider-app/earnings` | `GET` | Summary of completed trips and total earnings. |

---

## 3. Implementation Step-by-Step Guide

### Phase 1: Authentication & Profile
1.  **Environment Setup**: Verify JWT secret and database connection strings in `.env`.
2.  **Auth Routes**: Implement `register` and `login` for both roles with password hashing.
3.  **Profile Handlers**: Implement basic GET/PUT for profiles.

### Phase 2: Booking Core
1.  **Request Mechanism**: Implement `/api/customer/ride/request` to create a new `Order` record.
2.  **Rider Polling**: Implement `/api/rider-app/requests/available` so riders can see jobs.
3.  **Assignment**: Implement the `/ride/accept` logic (locking the order to a rider).

### Phase 3: Active Ride Cycle
1.  **OTP Logic**: Generate a 4-digit OTP when a ride is accepted; verify it on `start-ride`.
2.  **Status Sync**: Create handlers to transition order states: `Pending -> Accepted -> Arrived -> Started -> Delivered`.
3.  **Location Tracking**: Build the endpoint to update `LocationLog` table in real-time.

### Phase 4: Polish & History
1.  **History Views**: Aggregate queries for past trips for both customer and rider.
2.  **Fare Logic**: Finalize fare calculation based on distance/time logged in `Trip`.
3.  **Email/Notifications**: Integrate triggers for ride booking and completion.

---

## 5. Numerical Status Mapping (All Models)
To ensure consistency, all models now use integer-based status codes.

### Order Status
| Value | Label | Description |
| :--- | :--- | :--- |
| **0** | `Pending` | Created by customer, waiting for rider acceptance. |
| **1** | `Accepted`| A rider has accepted the job. |
| **2** | `Arrived` | Rider has reached the pickup location. |
| **3** | `Started` | Ride is in progress (OTP verified). |
| **4** | `Delivered`| Ride completed / Order delivered. |
| **5** | `Canceled` | Ride was canceled by customer or rider. |

### Rider Status
| Value | Label | Description |
| :--- | :--- | :--- |
| **0** | `Active` | Rider is online and ready for jobs. |
| **1** | `Suspended` | Account blocked due to issues. |
| **2** | `Offline` | Rider is logged out or unavailable. |

### Vehicle Status
| Value | Label | Description |
| :--- | :--- | :--- |
| **0** | `Available`| Vehicle is ready for a new trip. |
| **1** | `In Use` | Vehicle is currently on a trip. |
| **2** | `Maintenance`| Vehicle is broken or needs repair. |

### Trip Status
| Value | Label | Description |
| :--- | :--- | :--- |
| **0** | `Ongoing` | Trip is currently in progress. |
| **1** | `Completed`| Trip finished successfully. |
| **2** | `Cancelled`| Trip was terminated prematurely. |

---

## 6. Key Data Flow Example (Ride Lifecycle)
1.  **Customer** POSTs to `/ride/request` -> Order created (`status: 0`).
2.  **Rider** GETs `/requests/available` -> Sees order with `status: 0`.
3.  **Rider** POSTs to `/ride/accept` -> Order updated to `status: 1`.
4.  **Rider** POSTs to `/ride/arrive` -> Order updated to `status: 2`.
5.  **Rider** POSTs to `/ride/start` with OTP -> Order updated to `status: 3`.
6.  **Rider** POSTs to `/ride/complete` -> Order updated to `status: 4`.
