# **Hospital ticket automation app**
##### by Jokūbas Akramas
_This is web application for hospital queue management developed with Spring Boot and React.js._
### How to use  website
The working solution is available [here](http://hospital-app-ticket-bucket.s3-website.eu-west-2.amazonaws.com/) or by pasting link in browser `http://hospital-app-ticket-bucket.s3-website.eu-west-2.amazonaws.com/`. The first time you run website you should see gray box with welcoming message and cookie usage alert. When you load page second time it will be gone.
1. Main window
Unless you have an active session as a customer or a specialist this is default screen where the app starts.
![image](https://user-images.githubusercontent.com/47061836/113435475-8ef5c080-93eb-11eb-87ce-755b352f9ba4.png)
Here you have one of two options from whom to choose:
- __Generate ticket__:  Select a specialist from specialist list in dropdown list and click `Generate ticket`. This is when your session will be created and your browser will receive JSON web token as cookie for further communication with the backend.
- __Login as specialist__:  Press `Login as specialist` from bottom left corner. You will be presented with a modal with login form. Fill the form with correct credentials and press `Login`. Upon successfull login your browser will receive JSON web token as cookie for further communication with the backend.
![image](https://user-images.githubusercontent.com/47061836/113436095-bbf6a300-93ec-11eb-9a7f-8f22268dd35e.png)
    
    Here are all the available specialists credentials list.
    Title | Password
    ------------ | -------------
    Allergist | allergist12345
    Anesthesiologist | anesthesiologist12345
    Cardiologist | cardiologist12345
    Colon Surgeon | colonsurgeon12345
    Dermatologist | dermatologist12345
    Dentist | dentist12345
    Endocrinologist | endocrinologist12345
    Family Physician | familyphysician12345
    Gastroenterologist | gastroenterologist12345

2. Customer queue window
    When you generate a ticket you will be redirected to this window. In this window you will see your visit's details and customer queue before you.
    ![image](https://user-images.githubusercontent.com/47061836/113437936-3ecd2d00-93f0-11eb-913e-8e016c031f73.png)
    __Your visit time is generated automatically by backend and will depend on the last due (for this specialist) visit time and specialist's default visit time (this is set by administrator in database for every specialist).__
    In this view you have the ability to cancel the visit and see queue in real time. For example, `DENT-070` cancelled their visit, so you and other customers that are after aforementioned visit will receive new time and an alert of the action. 
    ![image](https://user-images.githubusercontent.com/47061836/113437978-54425700-93f0-11eb-9e77-9ee1243ebd33.png)
    Time for each affected customer is reassigned by setting previous customer's time (for example, time when we first joined this window was *21:05*, now it is *20:55*)  
    Alerts may be due to:
    - Someone in front of you (or you) cancelling visit. You will not receive alerts about this activity if customer is behind you.
    - Specialist starting/ending/cancelling visit for you or someone in front of you.
    
    Alerts and queue updates are executed without refreshing the screen by using STOMP messaging protocol for the best UX.

    Sub-windows
    - Visit start
    ![image](https://user-images.githubusercontent.com/47061836/113438929-3fff5980-93f2-11eb-801d-c8513d601f22.png)
    - Visit end
    ![image](https://user-images.githubusercontent.com/47061836/113438945-48f02b00-93f2-11eb-9332-96f52cb9e6b0.png)
    - Visit cancel
    ![image](https://user-images.githubusercontent.com/47061836/113439030-6a511700-93f2-11eb-8fed-a598ad870141.png)
        - if you (as customer) want to cancel your visit, you will be presented withe following confirmation modal:
    ![image](https://user-images.githubusercontent.com/47061836/113439008-61604580-93f2-11eb-96f2-cff683e38a82.png)
    After visit was ended or cancelled you can go back to main page. 
    
3. Specialist window
    When you login as specialist you will be redirected to this window. In this window you will be able to see and manage customers, registered for your consultation.
    ![image](https://user-images.githubusercontent.com/47061836/113440632-7a1e2a80-93f5-11eb-9d7d-253a9208e916.png)
    
    As a specialist you can:
    - Cancel your any visit. You can't cancel other specialists' visits.
    - Start the first visit if it's status is due. Once you start, you cannot cancel the visit.
      ![image](https://user-images.githubusercontent.com/47061836/113441383-df265000-93f6-11eb-8056-6452d24f99b1.png)
    - End started visit. 
    
    Once ended or cancelled, the visit will be removed from the table automatically.

    When you are registered as specialist, the alerts and external queue updates that you receive are as follows:
    - New visit alert - when new customer generates ticket for your consultation
    - Cancelled visit alert - when you or customer cancels the visit.
    
    Sub-windows
    - If there are no upcoming visits:
    ![image](https://user-images.githubusercontent.com/47061836/113441423-f8c79780-93f6-11eb-8d54-0172ffdbbe08.png)
4. Department screen (not available for general public)
    This is the window where all active and 5 upcoming visits are shown. To open this window you must connect to hospital VPN.
    
    **How to connect to hospital VPN:**
    1. Go to [VPN](https://ec2-18-168-30-143.eu-west-2.compute.amazonaws.com/?src=connect) address: `https://ec2-18-168-30-143.eu-west-2.compute.amazonaws.com/?src=connect`
    2. Login by providing VPN credentials. (Unfortunately I cannot provide these details to the general public. If you want to test this feature, please contact me directly at: `j.akramas@gmail.com`)
    
    ![image](https://user-images.githubusercontent.com/47061836/113443411-9bcde080-93fa-11eb-9eae-28cce3d6c648.png)
    
    3. Download and install VPN application depending on your system
    
    ![image](https://user-images.githubusercontent.com/47061836/113443928-8b6a3580-93fb-11eb-9c03-7e4bea077481.png)
    
    4. Connect to VPN using installed OpenVPN application. You will need to provide login credentials once again. 
    
    ![image](https://user-images.githubusercontent.com/47061836/113444558-cae55180-93fc-11eb-83f1-3f08bd9a6495.png)
    
    5. Check your IP. Success!
    
    ![image](https://user-images.githubusercontent.com/47061836/113444609-e2243f00-93fc-11eb-8f3d-62debb76a65b.png)

    Once you are connected to VPN you will see new card in the main page confirming that you are connected to hospital VPN:
    ![image](https://user-images.githubusercontent.com/47061836/113444749-2b748e80-93fd-11eb-9008-da6e1df94756.png)
    
    Click on `Open department screen` to view visits in real time:
    ![image](https://user-images.githubusercontent.com/47061836/113445028-b6ee1f80-93fd-11eb-8afb-71bbfced5692.png)
    
    As with customer and specialist windows the changes in this window are seen instantly, without the need of refreshing the screen. 

### How to run this project locally
To run this project locally you will need to:
1. Clone this repo
2. Install dependencies. You should have JDK 11 and npm installed.
3. Spin MySql database. The SQL dump can be downloaded [here](https://hospital-app-ticket-bucket.s3.eu-west-2.amazonaws.com/shared/hospital.sql) or by pasting link in browser `https://hospital-app-ticket-bucket.s3.eu-west-2.amazonaws.com/shared/hospital.sql`
4. Change environment variables in backend's `application.properties` to match your database credentials
    ```
    spring.datasource.url=${HOSPITAL_DB_SERVER}
    spring.datasource.username=${HOSPITAL_DB_USERNAME}
    spring.datasource.password=${HOSPITAL_DB_PASSWORD}
    ```
5. (Bonus) If you want to view department screen, change `internalIP` in `Frontend/src/shared/APIEndpoints.js` to match your current IP.
### System architecture

#### Use case diagram
![image](https://user-images.githubusercontent.com/47061836/113449715-2288ba80-9407-11eb-9842-3a83669cfb9f.png)
#### Activity diagrams
1. Generate ticket

![image](https://user-images.githubusercontent.com/47061836/113449889-7abfbc80-9407-11eb-8cce-d8133fa14c8a.png)

2. View customer queue

![image](https://user-images.githubusercontent.com/47061836/113450046-cb371a00-9407-11eb-9bff-67fccd6382d8.png)

3. Cancel visit

![image](https://user-images.githubusercontent.com/47061836/113450092-e4d86180-9407-11eb-84c7-8ca960444f79.png)

4. Login

![image](https://user-images.githubusercontent.com/47061836/113450142-fc174f00-9407-11eb-869a-c45356b3ff5d.png)

5. Mange customer queue

![image](https://user-images.githubusercontent.com/47061836/113450184-10f3e280-9408-11eb-898e-81f5f740abe3.png)

6. Start Visit

![image](https://user-images.githubusercontent.com/47061836/113450217-1f41fe80-9408-11eb-9dcd-d7228677a789.png)

7. End Visit

![image](https://user-images.githubusercontent.com/47061836/113450247-2ec14780-9408-11eb-8006-b131afb4fb33.png)

8. Display customer queue

![image](https://user-images.githubusercontent.com/47061836/113450297-413b8100-9408-11eb-8225-04b5494e46dd.png)

#### Class diagram

![image](https://user-images.githubusercontent.com/47061836/113450598-e5252c80-9408-11eb-99c9-746bf1c3d881.png)

#### State machine diagram

Visit state machine diagram

![image](https://user-images.githubusercontent.com/47061836/113490000-292f3480-94d0-11eb-8e25-8a8e910e95ba.png)

Thanks for reading :slightly_smiling_face:	
