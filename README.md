# trash-bin-api
---

## Usage

### User

Access the users redirect to `/user`

**Items:**

URL | Request Method | Description | Required Parameters |  Example use 
----|---------------| ----------- | ------------ | ------------
`/user/all` | `GET` | Get all the information of registered users | `user_id` | `/user/all?user_id={user_id}`
`/user/register` | `POST` | Registers the user to the database | `username`,`password`,`first name`, `last name`, `address`, `birthday` | `/user/register`
`/user/login` | `POST` | Authenticate user | `username` , `password`, `token` | `/user/login`
`/user/logout` |   `DELETE` | Logouts the user and device | `token` | `/user/logout`
`/user/change/password` | `PATCH` | Changes the user password | `username`, `old password`,`new password` | `/user/change/password`
`/user/change/information` | `PUT` | Changes the user information | `first name`, `last name`, `address`, `birthday` | `/user/change/information`

Example body for method request:

```json
{
  "username" : "bjarada",
  "password" : "bernella",
  "token" : "fcmToken"
}
```


### Waste 
Access the information regarding waste in bins: `/waste`

**Items:**


URL | Request Method | Description | Required Parameters |  Example use 
----|---------------| ----------- | ------------ | ------------
`/waste/dashboard` | `GET` | Get all the necessary information needed in dashboard | `user_id` | `/waste/dashboard?user_id={user_id}`
`/waste/records` | `GET`| Get all the records of waste the user converted into points | `user_id` | `/waste/records?user_id={user_id}`
`/waste/records/all` | `GET` | Get all the records of waste all the user converted into points | `user_id` | `/waste/records/all?user_id=admin_id`

Example output in JSON

```json
{
  "user_id": "user_id",
  "timestamp": "2024-11-10T19:18:50.741Z",
  "largest_category": "paper",
  "largest_point": 27.6,
  "recent_points": 13.8,
  "current_points": 70.1
}
```


### Transaction


Start a transaction with: `/transaction`

**Items:**
URL | Request Method | Description | Required Parameters |  Example use 
----|---------------| ----------- | ------------ | ------------
`/transaction/redeem` | `POST` | Redeems the points acquired by the user | `user_id`, `amount` | `/transaction/redeem`
`/transaction/records` | `GET` | Fetch the required records of transaction made in the system | `filter`, `user_id` | `/transaction/records?filter=individual&user_id=userid`, `/transaction/records?filter=all&user_id=admin_id` | 

Example request body for `/transaction/redeem`:

```json
{
  "user_id" : "user_idofUser",
  "amount" : 87
}
```