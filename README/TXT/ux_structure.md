# Structure Plane

wordUpp's structure is designed to provide a logical and seamless user flow. This includes intuitive navigation, categorisation of design tools, and a coherent pathway that guides users from selecting canvas size and choosing text effects to finalising their design masterpieces.


<details><summary>My Information Strutucture</summary>

 
## DownloadLog

- **user**: ForeignKey to the User model. Keeps track of which user performed the download.
- **download_date**: DateTimeField. Automatically captures the date and time when a download occurs.

---

## SubscriptionPlan

- **name**: CharField. The name of the subscription plan.
- **price**: DecimalField. The price of the subscription.
- **duration**: DurationField. How long does the subscription last?
- **stripe_plan_id**: CharField. Stripe's unique identifier for this subscription plan (optional).

---

## UserSubscription

- **user**: OneToOneField to User. The user associated with this subscription.
- **plan**: ForeignKey to SubscriptionPlan. The subscription plan the user is on.
- **start_date**: DateField. When the subscription starts.
- **end_date**: DateField. When the subscription ends (optional).
- **stripe_customer_id**: CharField. Stripe's unique identifier for this customer (optional).
- **stripe_subscription_id**: CharField. Stripe's unique identifier for this subscription (optional).
- **is_active**: BooleanField. Whether the subscription is active.
- **downloads_this_month**: IntegerField. How many downloads has the user used this month?

---

## MyStripeEventModel

- **stripe_event_id**: CharField. Unique identifier for the Stripe event.
- **type**: CharField. The type of Stripe event.
- **processed_at**: DateTimeField. When this event was processed.

---

## UserProfile

- **user**: OneToOneField to User. The user associated with this profile.


</details>





## User Flow

Here's a step-by-step walkthrough of a typical user session on Word Up:

1. **Landing Page**: 
    - The user lands on the homepage and is greeted with an engaging hero section and a quick overview of what Word Up offers.

2. **Registration/Login**: 
    - New users can register by clicking on the "Register" button.
    - Returning users can click the "Log In" button on the top menu to access their account.

3. **Dashboard**: 
    - Users arrive at the dashboard where they can see their current subscription tier and the download limits, if any.
    - A prompt for free-tier users to upgrade to the premium tier may appear.

4. **Canvas Selection**: 
    - Users can go to the canvas page to start a project.


5. **Art Creation**: 
    - They can select the canvas size based on popular social media dimensions.
	- they are given multiple menus and the option to manipulate the words and the backgrounds.

6. **Save/Download**: 
    - Once satisfied with their creation, users can click the download button and get their creation.
    - Free-tier users see a download counter, while premium users have unlimited downloads.

7. **Log Out/Exit**: 
    - Users can log out from the dashboard or close the application.

8. **Footer**: 
    - Throughout the session, users have the option to access general user information

## Information Architecture

### Main Top Menu

* available to all the websites (dynamic according to logged or not)

#### Footer 
- **Privacy Policy & Terms of Service**: Legal links are at the bottom of every page.
- © 2023 WORDUPP. ALL RIGHTS RESERVED.


#### Dashboard

- **Subscription Tier**: Displays the current subscription level of the user.
- **Upgrade Prompt**: A call-to-action for free-tier users to upgrade to the premium tier.


#### Canvas

- there are several menus for tools that you can use, organised in groups.
- you can click and drag horizontally to see all the tools from a category (works on mobile)
- all changes are immediately reflected on the canvas
- you have a download button 
- you have a limit of downloads in the case of the free tier; when you reach a limit, you get a message that the download button has become disabled. 


### Error Handling:

- All forms have error handling. They will specify which field the error is coming from.
- User-related error messages from the server are shown in the front end in a user-friendly manner.


 [NEXT ---> Skeleton Plane](ux_skeleton.md)