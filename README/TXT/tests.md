# Tests

## Validation

### HTML Validation

On the HTML validation, there were no errors.

There were warnings, but they were all related to Bootstrap 5 and how they designed their components. In this instance, the validator pointed out elements inside a 'p' or button tag without text.

another warning had to do with the tag that Bootstrap gave me the CDN; some fields seem not to be liked by the validator.

### CSS Validation

No errors were found on the CSS validator.

### JavaScript Linting

No errors were shown in the JS validator. there were a lot of warnings about using the ES6. For example, a warning for me using LET/CONST instead of VAR

### Python Linting

No errors were found on PEP8 on my Flask app.


### Accessibility

I got no error on the grounds of accessibility
<img src="../IMG/respons/bb.png" width="70%">

### Performance Testing

On all pages, "SEO" and "Best practices" are all in the between 83 and 98.
But the performance and Accessibility are higher in most pages 100.  

<img src="../IMG/respons/dd.png" width="70%">


## Feature Testing


### Responsiveness/Device Testing


The website was responsive on all devices I used to test. plus, I used hoverify to test their screen sizes


<img src="../IMG/respons/0aa.png" width="70%">
<img src="../IMG/respons/1aa.png" width="70%">

### Browser Compatibility Test

| Browser      | Device  | All Pages Test Status             |
|--------------|---------|----------------------------------|
| Chrome       | Desktop | ✅ Successful (All Pages)         |
| Chrome       | Mobile  | ✅ Successful (All Pages)         |
| Chrome       | Tablet  | ✅ Successful (All Pages)         |
| Firefox      | Desktop | ✅ Successful (All Pages)         |
| Firefox      | Mobile  | ✅ Successful (All Pages)         |
| Firefox      | Tablet  | ✅ Successful (All Pages)         |
| Safari       | Desktop | ✅ Successful (All Pages)         |
| Safari       | Mobile  | ✅ Successful (All Pages)         |
| Safari       | Tablet  | ✅ Successful (All Pages)         |

From registration to canvas art creation, every feature is sparkling on every browser and device.  


### Tools for testing

1. Macbook Pro M1 2021
1. Google Chrome
1. firefox
1. Safari
1. Hoverify (emulates an Extensive Mobile devices list)
1. Google Dev Tools
1. Huawei Mate 20
1. iMac 2019

## User stories testing



We've put our project to the test, darling, and here's how we fared against our user stories:

| User Story ID | Description                               | Test Status                        |
|---------------|-------------------------------------------|------------------------------------|
| US01          | Register a new account                    | ✅ Successful                      |
| US02          | Log in to existing account                | ✅ Successful                      |
| US03          | Subscribe to premium tier                 | ✅ Successful                      |
| US04          | View download limit for free-tier         | ✅ Successful                      |
| US05          | No download limit for premium users       | ✅ Successful                      |
| US06          | Access and use the canvas                 | ✅ Successful                      |
| US07          | Choose preset canvas sizes                | ✅ Successful                      |
| US08          | Download creations in image format        | ✅ Successful                      |
| US09          | Access FAQ section                        | ✅ Successful                      |
| US10          | Read terms and conditions                 | ✅ Successful                      |
| US11          | Read privacy policy                       | ✅ Successful                      |
| US12          | Delete the account  -deletes all and cancels subscription                    | ✅ Successful                      |
| US13          | change details and password                   | ✅ Successful                      |


All tests were conducted rigorously to ensure that each feature works as intended, providing a seamless experience for all users. 🌟


## stripe related test

1. Free user
	
* 1.1 needs to be informed of what tier they are. - ✅ Successful   
* 1.2 needs to know the downloads left for the month - ✅ Successful   
* 1.3 needs to have an upgrade button - ✅ Successful   
	- The upgrade button has to go to Stripe portal to proceed with the payment - ✅ Successful   

<img src="../IMG/testing/03.png" width="70%">

2. Premium User
* 2.1  needs to be informed of what tier they are. - ✅ Successful   
* 2.2  needs to be how many downloads have been made - ✅ Successful   
* 2.3 needs to have a manage subscription button - ✅ Successful  
	- it should redirect to Stripe portal. - ✅ Successful  
		- you can cancel the subscription - ✅ Successful  
		- you can change payment details - ✅ Successful  
		- you can see invoices for older payments - ✅ Successful  

<img src="../IMG/testing/02.png" width="70%">

3. Premium User that downgraded - ✅ Successful  
* 3.1 same as a premium user - ✅ Successful  
* 3.2 has a message saying until the user what date has the premium privileges from the last cycle. - ✅ Successful  

<img src="../IMG/testing/01.png" width="70%">

## Bugs

* Once the user registers, sometimes they get redirected to the dashboard already logged in, and sometimes they get not logged in and have to log in again. I couldn't find out what makes this unpredictable behaviour.

* Colour picker works differently in Firefox, so it only updates the canvas once you click off the picker. It doesn't produce any errors, just a less smooth user experience. 

* Fonts don't seem to load well on Safari; I have seen this issue online but couldn't find a way to make it work for my project.





| [Deployment <---- Before](dep.md)  | [NEXT ---> Credits](credits.md) |
|:----------|:----------|