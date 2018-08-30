"use strict";

const express = require("express");
const bodyParser = require("body-parser");
var session = require('express-session');
const { dialogflow } = require('actions-on-google');
const {Confirmation} = require('actions-on-google');
const {SimpleResponse} = require('actions-on-google');
const {List} = require('actions-on-google');
const {Suggestions} = require('actions-on-google');
const url = require('url');
const {BasicCard} = require('actions-on-google');
const {Button} = require('actions-on-google');
const {Image} = require('actions-on-google');
const {SignIn} = require('actions-on-google');
process.env.DEBUG = 'actions-on-google:*';
const Welcome_Intent = 'input.welcome';
const ActionFetchKB = 'Fetch_KBs';
const ActionGetKBDetails = 'item.selected';
const ActionLogIncident = 'Log_Incident';
const ActionLogSR = 'Log_Request';

const restService = express();

restService.use(
  bodyParser.urlencoded({
      extended: true
  })
);

const app = dialogflow();
let date = require('date-and-time');

const asyncTask = () => new Promise(
  resolve => setTimeout(resolve, 8000)
);


restService.use(bodyParser.json(),app);

restService.listen(process.env.PORT || 8000, function () {
    console.log("SIA is up and listening");
});

app.intent('Default Welcome Intent', conv => 
{
    conv.data.symptom = "";
    conv.data.incidentConfirmator = "";
    conv.data.category = "";
    conv.data.catalogName = "";
    conv.data.description = "";
    conv.data.catalogID = "";
    conv.data.categoryID = "";
    conv.data.questions = [];
    conv.data.userEmailId = '';
    conv.data.userID = '';

    if(conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        console.log("Inside Welcome Intent");
        conv.ask(new SignIn('To get your account details'));
    }
    else
    {
        conv.contexts.set('identify_incident',1);
        conv.contexts.set('identify_SR',1);
        conv.contexts.set('identify_status',1);
        conv.contexts.set('Last_Incident_Status',1);
        conv.contexts.set('Last_SR_Status',1);
        conv.contexts.set('Last_week_incident',1);
        conv.contexts.set('Last_week_SR',1); 

        conv.ask(new SimpleResponse({
            speech: 'Hi, I am Summit Cinde. I can help you with your incidents and service requests: For example, you can ask me things like: My outlook is not working, I need virtual machine, What is the status of my last incident and so on.',
            text:'Hi, I am Summit Cinde. I can help you with your incidents and service requests: For example, you can ask me things like: My outlook is not working, I need virtual machine, What is the status of my last incident and so on.',        
        }));   
        conv.ask('So, How can I help you?');
    }

});

app.intent('Get Signin', (conv, params, signin) => {

    console.log('Inside Login Confirmation===>');
    var authUserName = '';
    var authUserEmailId = '';
    var summitUserName = '';
    var summitUserEmailId = '';
    var summitUserID = '';
    var displayText = '';
    var textToSpeech = '';
    var chatBotID = 'abc';

    if (signin.status !== 'OK') 
    {
        return conv.ask('You need to sign in before using the app.');
    }
    const accessToken = conv.user.access.token;
    console.log("Access Token===>",accessToken);
    return new Promise(function(resolve,reject)
    {
        GetAuthUserDetails(accessToken,function(userDetailsJSON)
        {
            console.log("UserDetailsJSON===>",userDetailsJSON);
            if(userDetailsJSON != '')
            {
                authUserName = userDetailsJSON.name;
                authUserEmailId = userDetailsJSON.email;
                conv.data.userEmailId = userDetailsJSON.email;
                GetSummitUserDetails(authUserEmailId,chatBotID,function(userExistsJSON)
                {
                    console.log("User Exists JSON==>",userExistsJSON);
                    if(userExistsJSON.Remarks == "USER_EXISTS")
                    {
                        summitUserName = userExistsJSON.UserName;
                        summitUserEmailId = userExistsJSON.EmailID;
                        summitUserID = userExistsJSON.UserID;  
                        conv.data.userID = userExistsJSON.UserID;
                        conv.data.userName = userExistsJSON.UserName;

                        displayText = 'Hi, '+summitUserName+'! Thanks for signing in.';
                        textToSpeech = 'Hi, '+summitUserName+'! Thanks for signing in.';

                        conv.contexts.set('identify_incident',1);
                        conv.contexts.set('identify_SR',1);
                        conv.contexts.set('identify_status',1);
                        conv.contexts.set('Last_Incident_Status',1);
                        conv.contexts.set('Last_SR_Status',1);
                        conv.contexts.set('Last_week_incident',1);
                        conv.contexts.set('Last_week_SR',1); 

                        conv.ask(new SimpleResponse({
                            speech: displayText,
                            text: textToSpeech,
                        }));
                        conv.ask(new SimpleResponse({
                            speech: 'I am Cinde. I can help you with your incidents and service requests: For example, you can ask me things like:',
                            text:'I am Cinde. I can help you with your incidents and service requests: For example, you can ask me things like:',        
                        }), new Suggestions(['My outlook is not working','I need virtual machine','My Wi-fi is not working']));
                        resolve();
                    
                    }
                    else
                    {
                        displayText = 'User does not Exist. Kindly try again with a valid user.';
                        textToSpeech = 'User does not Exist. Kindly try again with a valid user.';
                        conv.ask(new SimpleResponse({
                            speech: textToSpeech,
                            text: textToSpeech,
                        }));
                        resolve();
                    
                    }
                
                })

            }   
        })
    })

});

app.intent('Intro_Wishes', conv => 
{
    conv.data.symptom = "";
    conv.data.incidentConfirmator = "";
    conv.data.category = "";
    conv.data.catalogName = "";
    conv.data.description = "";
    conv.data.catalogID = "";
    conv.data.categoryID = "";
    conv.data.questions = [];

    var timeperiod = conv.parameters['FourPeriodsOfADay'];
    var greetings = "";
    console.log("Parameters====>",conv.parameters);
    console.log('timeperiod===>',timeperiod);
    if(timeperiod.toLowerCase() == 'morning')
    {
        greetings = "Good Morning, ";
    }
    else if(timeperiod.toLowerCase() == 'afternoon')
    {
        greetings = "Good Afternoon, ";
    }
    else if (timeperiod.toLowerCase() == 'evening')
    {
        greetings = "Good Evening, ";   
    }
    else if(timeperiod.toLowerCase() == 'night')
    {
        greetings = "Good Night, ";  
    }
    else
    {
        greetings = "Hi, ";
    }

    if(conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        conv.ask(new SimpleResponse({
            speech: greetings+ 'I can help you with your incidents and service requests: For example, you can ask me things like:',
            text: greetings+'I can help you with your incidents and service requests: For example, you can ask me things like:',        
        }), new Suggestions(['My outlook is not working','I need virtual machine','My Wi-fi is not working']));
    }
    else
    {
        conv.ask(greetings+'I can help you with your incidents and service requests. For example, you can ask me things like, My outlook is not working, I need virtual machine, My Wi-Fi is not working.'); 
        conv.ask('So, how can I help you?');
    }

});

app.intent('Intro_Askaboutbot', conv => 
{
    conv.data.symptom = "";
    conv.data.incidentConfirmator = "";
    conv.data.category = "";
    conv.data.catalogName = "";
    conv.data.description = "";
    conv.data.catalogID = "";
    conv.data.categoryID = "";
    conv.data.questions = [];

    if(conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        conv.ask('It\'s been a great day so far. Feeling ready to get to work and help you with your queries.');
        conv.ask(new SimpleResponse({
            speech: 'For example, you can ask me things like:',
            text: 'For example, you can ask me things like:',        
        }), new Suggestions(['My outlook is not working','I need virtual machine','My Wi-fi is not working']));
    }
    else
    {
        conv.ask('It\'s been a great day so far. Feeling ready to get to work and help you with your queries. For example, you can ask me things like, My outlook is not working, I need virtual machine, My Wi-Fi is not working.'); 
        conv.ask('So, how can I help you?');
    }

});

app.intent('Log_Incident_Utterances',function (conv) 
{
    var resolvedQuery =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var incidentIdentifier = conv.parameters['Incident_Identifier'];
    var Symptom = "";
    console.log("Incoming string===>",resolvedQuery);
    console.log("Incident Indentifier====>",incidentIdentifier);

    if ( incidentIdentifier !== "" && resolvedQuery !== "" && resolvedQuery.indexOf(incidentIdentifier) !== -1 )
    {
        Symptom = resolvedQuery;
        conv.data.symptom = Symptom;
    }

    if(conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT') && Symptom != "")
    {      
        return new Promise(function(resolve,reject)
        {
            GetKBArticles(Symptom,function(KBArticlesArr)
            {
                if(KBArticlesArr.length > 0)
                {    
                    conv.data.KBArticlesArray = KBArticlesArr;
                    conv.contexts.set('kb_articles_confirmation',1);
                    conv.ask(new SimpleResponse({
                        speech: 'Hey! I have a few recommendations for your problem. Would you like to review them before logging the incident?',
                        text: 'Hey! I have a few recommendations for your problem. Would you like to review them before logging the incident?',
                    }),new Suggestions(['Yes', 'No']));
                    resolve();
                }
                else
                {
                    console.log("Symptom====>",Symptom);
                    conv.contexts.set('log_incident_confirmation',1);
                    conv.ask(new SimpleResponse({
                        speech: 'Do you want me to log an incident for you?',
                        text: 'Do you want me to log an incident for you?',
                    }),new Suggestions(['Yes', 'No']));   
                    resolve();
                }

            })    
        })
    }
    else if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT') && Symptom != "")
    {
        console.log("Symptom====>", Symptom);
        conv.contexts.set('log_incident_confirmation', 1);
        conv.ask(new SimpleResponse({
            speech: 'Do you want me to log an incident for you?',
            text: 'Do you want me to log an incident for you?',
        }), new Suggestions(['Yes', 'No']));
    }
    else
    {
        conv.data.symptom = "";
            conv.ask("Sorry, Could not interpret that. But I'm learning.");
            conv.ask(new SimpleResponse({
                speech: 'Is there something else do you want me to assist you?',
                text: 'Is there something else do you want me to assist you?',
            }),new Suggestions(['Yes', 'No']));
    }

});

app.intent('KB_Articles_Confirmation',function(conv, params, confirmation)
{
    console.log("Inside KB Articles Confirmation===>",confirmation);
    console.log("KB Array====>",conv.data.KBArticlesArray);
    var textToSpeech = "";
    var displayText = "";

    if (confirmation.toLowerCase() == 'yes' && conv.data.KBArticlesArray.length > 0 )       
    {

        //console.log("KBArticlesArr====>",KBArticlesArr);
        var Items = {};
        console.log("KB Array length===>",conv.data.KBArticlesArray.length);
        for (var i = 0; i < conv.data.KBArticlesArray.length; i++)
         {
            Items[conv.data.KBArticlesArray[i].KB_ID] = {};
            Items[conv.data.KBArticlesArray[i].KB_ID].title = conv.data.KBArticlesArray[i].KB_Subject;
            Items[conv.data.KBArticlesArray[i].KB_ID].description = conv.data.KBArticlesArray[i].KB_Details;   
         }
                console.log("Items====>",Items);
                conv.contexts.set('kb_useful_confirmation',1);


                textToSpeech = 'Here are a few recommendations related to "'+conv.data.symptom+'". Please have a look and let me know whether the recommendations were helpful or not.';
                displayText = 'Here are a few recommendations related to "'+conv.data.symptom+'". Please have a look and let me know whether the recommendations were helpful or not.';

                conv.ask(new SimpleResponse({
                    speech: textToSpeech,
                    text: displayText,
                }));
                //Create a list
                conv.ask(new List({
                    title: 'List of Recommendations',
                    items: Items,
                }),            
                new Suggestions(['Helpful', 'Not Helpful'])                
                );  
    }
    else
    {
        conv.contexts.set('log_incident_confirmation',1);
        conv.ask(new SimpleResponse({
            speech: 'Do you want me to log an incident for you?',
            text: 'Do you want me to log an incident for you?',
        }),new Suggestions(['Yes','No']));  
    }

});

app.intent('KBs_Useful_Confirmation',function(conv)
{
    var confirmation = conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    if (confirmation.toLowerCase() == 'helpful')       
    {
        conv.data.symptom = "";
        conv.contexts.set('end_conversation',1);
        conv.ask('Hurray! I am glad to note that the recommendations were of help to you! ');       
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you?',
            text: 'Is there something else do you want me to assist you?',
        }),new Suggestions(['Yes','No']));  
    }
    else
    {
        conv.contexts.set('log_incident_confirmation',1);
        conv.ask('I get that! I will take this as an input. After all, I like to continuously learn from our conversations. ');
        conv.ask(new SimpleResponse({
            speech: 'Do you want me to log an incident for you?',
            text: 'Do you want me to log an incident for you?',
        }),new Suggestions(['Yes','No']));  
    }

});

app.intent('Log_Incident_confirmation', function(conv, params, confirmation) 
{
    console.log("Confirmation===>",confirmation);
    conv.data.incidentConfirmator = confirmation;
    if ( confirmation.toLowerCase() == 'yes')       
    {
        conv.ask('Please provide me the detailed description.');
    } 
    else 
    {
        conv.data.symptom = "";
        conv.contexts.set('end_conversation',1);
        conv.ask("Hmmm, looks like your problem is resolved! ");
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you?',
            text: 'Is there something else do you want me to assist you?',
        }),new Suggestions(['Yes', 'No']));

    }
});

app.intent('Get_Description',function(conv)
{
    var userID = '';
    var description =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var  textToSpeech = "";
    var displayText = "";
    console.log("Description=====>",description);
    console.log("Symptom========>",conv.data.symptom);
    console.log("Confirmation========>",conv.data.incidentConfirmator);
    console.log("UserID====>",conv.data.userID);
    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }
    if(description !== "" && conv.data.symptom !== "" && conv.data.incidentConfirmator.toLowerCase() === 'yes')
    {
            conv.contexts.set('end_conversation',1);
            logIncident(userID,conv.data.symptom, description, function (json)
            {
                displayText = json.Message + ' and the Ticket Number is ' + json.TicketNo + '. ';
                numberToDigit(json.TicketNo, function (ticknum) {
                    console.log("Corrected Ticket Number",ticknum);
                    textToSpeech = json.Message + ' and the Ticket Number is ' + ticknum + '. ';
                })
            })
            
    }
    else
    {
        console.log("else");
        conv.contexts.set('end_conversation',1);
        textToSpeech='Sorry, Could not log an incident.';
        displayText = "Sorry, Could not log an incident.";
    }
    conv.data.symptom = "";
    return asyncTask()
      .then(() => conv.ask(new SimpleResponse({
          speech: textToSpeech,
          text: displayText,
      }),new SimpleResponse({
          speech: 'Is there something else do you want me to assist you ?',
          text: 'Is there something else do you want me to assist you ?',
      }),new Suggestions(['Yes', 'No'])));

   
});

app.intent('Fetch_Category',function (conv) 
{
    var catalogName = '';
    var categoryName = '';
    var categoryDescription = '';
    var description = '';
    var catalogID = 0;
    var categoryID = 0;
    var textToSpeech = ''; 
    var requestIdentifier = '';
    var searchString = '';
    var isCategory = '';
    var isLeafNode = '';
    var userID = '';
    var Items = {};  
    var listValuesString = '';
    
    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }

    searchString = conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
   
    if(conv.parameters['Request_Identifier'] != "")
    {
        requestIdentifier = conv.parameters['Request_Identifier'];
    } 
    console.log("Search String===>",searchString);

    console.log("Request_Identifier===>",conv.parameters['Request_Identifier']);


    if((searchString.toLowerCase()).indexOf(requestIdentifier.toLowerCase()) !== -1)
    {
        return new Promise( function( resolve, reject )
        {
            GetServiceCatalogDetails(searchString, function (ServiceCatalogDetailsArr)
            {   
                console.log("ServiceCatalogDetailsArr===>",ServiceCatalogDetailsArr);

                if (ServiceCatalogDetailsArr.length === 1)
                {

                    console.log("Inside if===>");
                    categoryID = ServiceCatalogDetailsArr[0].CategoryID;
                    categoryName = ServiceCatalogDetailsArr[0].CategoryName;
                    categoryDescription = ServiceCatalogDetailsArr[0].CategoryDescription;
                    isCategory = ServiceCatalogDetailsArr[0].IsCategory;
                    isLeafNode = ServiceCatalogDetailsArr[0].IsLeafNode;

                    if (categoryID !== 0)
                    {
                        conv.data.categoryID = categoryID;
                    }
                    if (categoryName !== '')
                    {
                        conv.data.categoryName = categoryName;
                    }
                    if (isLeafNode !== '')
                    {
                        conv.data.isLeafCategory = isLeafNode;
                    }


                    console.log("  categoryID  " + categoryID + "  categoryName  " + categoryName);

                    if (isCategory == 1)
                    {
                        GetSRCatalogDetails(userID, categoryID, isLeafNode, function (CatalogDetailsArray)
                        {
                            if (isLeafNode == 1)
                            {
                                if (CatalogDetailsArray.length == 1)
                                {
                                    catalogID = CatalogDetailsArray[0].CatalogID;
                                    catalogName = CatalogDetailsArray[0].CatalogName;
                                    description = CatalogDetailsArray[0].Description;

                                    console.log("Description===>", description);

                                    conv.data.catalogID = CatalogDetailsArray[0].CatalogID;
                                    conv.data.catalogName = CatalogDetailsArray[0].CatalogName;
                                    conv.contexts.set('Log_SR_Confirmation', 1);
                                    conv.ask(new SimpleResponse({
                                        speech: "Do you want to create a Service Request for " + catalogName + "?",
                                        text: "Do you want to create a Service Request for " + catalogName + "?",
                                    }), new Suggestions(['Yes', 'No']));
                                    resolve();
                                }

                                if (CatalogDetailsArray.length > 1)
                                {
                                    for (var i = 0; i < CatalogDetailsArray.length; i++)
                                    {
                                        var id = CatalogDetailsArray[i].CatalogID + ',' + CatalogDetailsArray[i].CatalogName;
                                        Items[id] = {};
                                        Items[id].title = CatalogDetailsArray[i].CatalogName;
                                        listValuesString += CatalogDetailsArray[i].CatalogName + ', ';
                                    }
                                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                    {
                                        textToSpeech = 'Ok, Looks like we have many options related to your request! Please select one of the below options so that I can proceed with your request.';
                                        conv.contexts.set('fetch_catalog', 1);
                                        conv.ask(textToSpeech);
                                        //Create a list
                                        conv.ask(new List({
                                            items: Items
                                        }));
                                        resolve();
                                    }
                                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                    {
                                        textToSpeech = 'Ok, Looks like we have many options related to your request! Such as ' + listValuesString + '. Which one do you want?';
                                        conv.contexts.set('fetch_catalog', 1);
                                        conv.ask(textToSpeech);
                                        resolve();
                                    }


                                }

                            }

                            if (isLeafNode == 0)
                            {
                                if (CatalogDetailsArray.length == 1)
                                {
                                    categoryID = CatalogDetailsArray[0].CategoryID;
                                    isLeafNode = CatalogDetailsArray[0].IsLeafCategory;
                                    categoryName = CatalogDetailsArray[0].CategoryName;
                                    conv.data.categoryID = CatalogDetailsArray[0].CategoryID;
                                    conv.data.categoryName = CatalogDetailsArray[0].CategoryName;
                                    conv.data.isLeafCategory = CatalogDetailsArray[0].IsLeafCategory;

                                    if (isCategory == 1 && isLeafNode == 1)
                                    {
                                        GetSRCatalogDetails(userID, categoryID, isLeafNode, function (CatalogDetailsArray)
                                        {
                                            if (CatalogDetailsArray.length == 1)
                                            {
                                                catalogID = CatalogDetailsArray[0].CatalogID;
                                                catalogName = CatalogDetailsArray[0].CatalogName;
                                                description = CatalogDetailsArray[0].Description;

                                                console.log("Description===>", description);
                                                conv.data.catalogID = CatalogDetailsArray[0].CatalogID;
                                                conv.data.catalogName = CatalogDetailsArray[0].CatalogName;
                                                conv.contexts.set('Log_SR_Confirmation', 1);
                                                conv.ask(new SimpleResponse({
                                                    speech: "Do you want to create a Service Request for " + catalogName + "?",
                                                    text: "Do you want to create a Service Request for " + catalogName + "?",
                                                }), new Suggestions(['Yes', 'No']));
                                                resolve();

                                            }
                                            else
                                            {
                                                for (var i = 0; i < CatalogDetailsArray.length; i++)
                                                {
                                                    var id = CatalogDetailsArray[i].CatalogID + ',' + CatalogDetailsArray[i].CatalogName;
                                                    Items[id] = {};
                                                    Items[id].title = CatalogDetailsArray[i].CatalogName;
                                                    listValuesString += CatalogDetailsArray[i].CatalogName + ', ';
                                                }

                                                if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                                {
                                                    textToSpeech = 'Ok, Looks like we have many options related to your request! Please select one of the below options so that I can proceed with your request.';
                                                    conv.contexts.set('fetch_catalog', 1);
                                                    conv.ask(textToSpeech);
                                                    //Create a list
                                                    conv.ask(new List({
                                                        items: Items
                                                    }));
                                                    resolve();
                                                }
                                                if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                                {
                                                    textToSpeech = 'Ok, Looks like we have many options related to your request! Such as ' + listValuesString + '. Which one do you want?';
                                                    conv.contexts.set('fetch_catalog', 1);
                                                    conv.ask(textToSpeech);
                                                    resolve();

                                                }


                                            }
                                        })

                                    }

                                }

                                if (CatalogDetailsArray.length > 1)
                                {
                                    for (var i = 0; i < CatalogDetailsArray.length; i++)
                                    {
                                        var id = CatalogDetailsArray[i].CategoryID + ',' + CatalogDetailsArray[i].IsLeafCategory + ',' + 1 + ',' + CatalogDetailsArray[i].CategoryName;
                                        Items[id] = {};
                                        Items[id].title = CatalogDetailsArray[i].CategoryName;
                                        listValuesString += CatalogDetailsArray[i].CatalogName + ', ';
                                    }
                                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                    {
                                        textToSpeech = 'Ok, Looks like we have many options related to your request! Please select one of the below options so that I can proceed with your request.';
                                        conv.contexts.set('fetch_sub_categories', 1);
                                        conv.ask(textToSpeech);
                                        //Create a list
                                        conv.ask(new List({
                                            items: Items
                                        }));
                                        resolve();
                                    }
                                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                    {
                                        textToSpeech = 'Ok, Looks like we have many options related to your request! Such as ' + listValuesString + '. Which one do you want?';
                                        conv.contexts.set('fetch_sub_categories', 1);
                                        conv.ask(textToSpeech);
                                        resolve();

                                    }


                                }
                            }

                        })
                    }
                    else
                    {
                        conv.data.catalogID = categoryID;
                        conv.contexts.set('Log_SR_Confirmation', 1);
                        conv.ask(new SimpleResponse({
                            speech: "Do you want to create a Service Request for " + categoryName + "?",
                            text: "Do you want to create a Service Request for " + categoryName + "?",
                        }), new Suggestions(['Yes', 'No']));
                        resolve();
                    }
                    
                }

                else if (ServiceCatalogDetailsArr.length > 1)
                {
                    console.log("Inside else if===>");
                    for (var i = 0; i < ServiceCatalogDetailsArr.length; i++)
                    {
                        var id = ServiceCatalogDetailsArr[i].CategoryID + ',' + ServiceCatalogDetailsArr[i].IsLeafNode + ',' + ServiceCatalogDetailsArr[i].IsCategory + ',' + ServiceCatalogDetailsArr[i].CategoryName ;
                        Items[id] = {};
                        Items[id].title = ServiceCatalogDetailsArr[i].CategoryName;
                        listValuesString += ServiceCatalogDetailsArr[i].CategoryName + ', ';
                    }
                    console.log("Items====>", Items);
                    console.log("Service Catalog Length===>", ServiceCatalogDetailsArr.length);
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'Ok, Looks like we have many options related to your request! Please select one of the below options so that I can proceed with your request.';
                        conv.contexts.set('fetch_sub_categories', 1);
                        conv.ask(textToSpeech);
                        //Create a list
                        conv.ask(new List({
                            items: Items
                        }));
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'Ok, Looks like we have many options related to your request! Such as ' + listValuesString + '. Which one do you want?';
                        conv.contexts.set('fetch_sub_categories', 1);
                        conv.ask(textToSpeech);
                        resolve();

                    }


                }

                else
                {
                    console.log("Inside else===>");
                    conv.contexts.set('identify_SR', 1);
                    conv.contexts.set('identify_incident', 1);
                    conv.contexts.set('identify_status', 1);
                    conv.contexts.set('Last_Incident_Status', 1);
                    conv.contexts.set('Last_SR_Status', 1);
                    conv.contexts.set('Last_week_incident', 1);
                    conv.contexts.set('Last_week_SR', 1);
                    console.log("Session Stored Category: " + conv.data.category);
                    textToSpeech = "I am afraid to tell that the requested entity is not found in the list. I may be wrong. Hence, kindly request you to be more specific regarding your request so that I can help you with it.";
                    console.log("Speech: " + textToSpeech);
                    conv.ask(textToSpeech);
                    resolve();
                }

            })
        })
    }
    else
    {
        conv.ask("Sorry, Could not interpret that. But I'm learning.");
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you?',
            text: 'Is there something else do you want me to assist you?',
        }),new Suggestions(['Yes', 'No']));   
    }
    
});

app.intent('Fetch_SubCategories', function (conv, params, option)
{
    var string = '';
    var categoryID = '';
    var isCategory = '';
    var isLeafNode = '';
    var categoryName = '';
    var userID = '';
    var Items = {}; 
    var textToSpeech = '';
    var listValuesString = '';

    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }

    if (option)
    {
        string = option;
    }

    var str_array = string.split(',');

    if (str_array[0] != '')
    {
        categoryID = str_array[0];
        conv.data.categoryID = str_array[0];
    }

    if (str_array[1] != '')
    {
        isLeafNode = str_array[1];
    }
    if (str_array[2] != '')
    {
        isCategory = str_array[2];
    }
    if (str_array[3] != '')
    {
        categoryName = str_array[3];
        conv.data.categoryName = str_array[3];
    }

    console.log("Category ID====>", categoryID);
    console.log("isLeafNode====>", isLeafNode);
    console.log("isCategory====>", isCategory);


    if (categoryID != '' && isCategory == 1 && isLeafNode == 1)
    {
        return new Promise(function (resolve, reject)
        {

            GetSRCatalogDetails(userID, categoryID, isLeafNode, function (CatalogDetailsArray)
            {
                if (CatalogDetailsArray.length == 1)
                {
                    catalogID = CatalogDetailsArray[0].CatalogID;
                    catalogName = CatalogDetailsArray[0].CatalogName;
                    description = CatalogDetailsArray[0].Description;

                    conv.data.catalogID = CatalogDetailsArray[0].CatalogID;
                    conv.data.catalogName = CatalogDetailsArray[0].CatalogName;
                    conv.contexts.set('Log_SR_Confirmation', 1);
                    conv.ask(new SimpleResponse({
                        speech: "Do you want to create a Service Request for " + description + "?",
                        text: "Do you want to create a Service Request for " + description + "?",
                    }), new Suggestions(['Yes', 'No']));
                    resolve();

                }
                else
                {
                    for (var i = 0; i < CatalogDetailsArray.length; i++)
                    {
                        var id = CatalogDetailsArray[i].CatalogID + ',' + CatalogDetailsArray[i].CatalogName;
                        Items[id] = {};
                        Items[id].title = CatalogDetailsArray[i].CatalogName;
                        listValuesString += CatalogDetailsArray[i].CatalogName + ', ';
                    }

                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'I have found few variants under your request. Select any one of them to create a Service Request.';
                        conv.contexts.set('fetch_catalog', 1);
                        conv.ask(textToSpeech);
                        //Create a list
                        conv.ask(new List({
                            items: Items
                        }));
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'I have found few variants under your request. Such as ' + listValuesString + '. Which one do you want?';
                        conv.contexts.set('fetch_catalog', 1);
                        conv.ask(textToSpeech);
                        resolve();
                    }
                }
            })
        })
    }

    if (categoryID != '' && isCategory == 1 && isLeafNode == 0)
    {
        return new Promise(function (resolve, reject)
        {

            GetSRCatalogDetails(userID, categoryID, isLeafNode, function (CatalogDetailsArray)
            {
                if (CatalogDetailsArray.length == 1)
                {
                    categoryID = CatalogDetailsArray[0].CategoryID;
                    isLeafNode = CatalogDetailsArray[0].IsLeafCategory;
                    categoryName = CatalogDetailsArray[0].CategoryName;
                    conv.data.categoryID = CatalogDetailsArray[0].CategoryID;
                    conv.data.categoryName = CatalogDetailsArray[0].CategoryName;
                    conv.data.isLeafCategory = CatalogDetailsArray[0].IsLeafCategory;

                    if (isCategory == 1 && isLeafNode == 1)
                    {
                        GetSRCatalogDetails(userID, categoryID, isLeafNode, function (CatalogDetailsArray)
                        {
                            if (CatalogDetailsArray.length == 1)
                            {
                                catalogID = CatalogDetailsArray[0].CatalogID;
                                catalogName = CatalogDetailsArray[0].CatalogName;
                                description = CatalogDetailsArray[0].Description;

                                conv.data.catalogID = CatalogDetailsArray[0].CatalogID;
                                conv.data.catalogName = CatalogDetailsArray[0].CatalogName;
                                conv.contexts.set('Log_SR_Confirmation', 1);
                                conv.ask(new SimpleResponse({
                                    speech: "Do you want to create a Service Request for " + description + "?",
                                    text: "Do you want to create a Service Request for " + description + "?",
                                }), new Suggestions(['Yes', 'No']));
                                resolve();

                            }
                            else
                            {
                                for (var i = 0; i < CatalogDetailsArray.length; i++)
                                {
                                    var id = CatalogDetailsArray[i].CatalogID + '' + CatalogDetailsArray[i].CatalogName;
                                    Items[id] = {};
                                    Items[id].title = CatalogDetailsArray[i].CatalogName;
                                    listValuesString += CatalogDetailsArray[i].CatalogName + ', ';
                                }
                                if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                {
                                    textToSpeech = 'I have found few variants under your request. Select any one of them to create a Service Request.';
                                    conv.contexts.set('fetch_catalog', 1);
                                    conv.ask(textToSpeech);
                                    //Create a list
                                    conv.ask(new List({
                                        title: 'Available Catalogs',
                                        items: Items
                                    }));
                                    resolve();
                                }
                                if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                                {
                                    textToSpeech = 'I have found few variants under your request. Such as ' + listValuesString + '. Which one do you want?';
                                    conv.contexts.set('fetch_catalog', 1);
                                    conv.ask(textToSpeech);
                                    resolve();
                                }

                            }
                        })

                    }

                }

                if (CatalogDetailsArray.length > 1)
                {
                    for (var i = 0; i < CatalogDetailsArray.length; i++)
                    {
                        var id = CatalogDetailsArray[i].CategoryID + ',' + CatalogDetailsArray[i].IsLeafCategory + ',' + 1 + ',' + CatalogDetailsArray[i].CategoryName;
                        Items[id] = {};
                        Items[id].title = CatalogDetailsArray[i].CategoryName;
                        listValuesString += CatalogDetailsArray[i].CategoryName + ', ';
                    }

                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'I have found few variants under your request. Select any one of them to create a Service Request.';
                        conv.contexts.set('fetch_sub_categories', 1);
                        conv.ask(textToSpeech);
                        //Create a list
                        conv.ask(new List({
                            items: Items
                        }));
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'I have found few variants under your request. Such as ' + listValuesString + '. Which one do you want?';
                        conv.contexts.set('fetch_sub_categories', 1);
                        conv.ask(textToSpeech);
                        resolve();
                    }
                }
            })
        })

    }

    if (categoryID != '' && isCategory == 0)
    {
        conv.data.catalogID = categoryID;
        conv.contexts.set('Log_SR_Confirmation', 1);
        conv.ask(new SimpleResponse({
            speech: "Do you want to create a Service Request for " + categoryName + "?",
            text: "Do you want to create a Service Request for " + categoryName + "?",
        }), new Suggestions(['Yes', 'No']));
    }
});

app.intent('Fetch_Catalogs', function (conv, params, option)
{
    var catalogID = '';
    var catalogName = '';
    var string = '';

    if (option)
    {
        string = option;
    }

    var str_array = string.split(',');

    if (str_array[0] != '')
    {
        catalogID = str_array[0];
    }

    if (str_array[1] != '')
    {
        catalogName = str_array[1];
    }

    console.log("CatalogID====>", catalogID);

    conv.data.catalogID = catalogID;
    conv.contexts.set('Log_SR_Confirmation', 1);
    conv.ask(new SimpleResponse({
        speech: "Do you want to create a Service Request for " + catalogName + "?",
        text: "Do you want to create a Service Request for " + catalogName + "?",
    }), new Suggestions(['Yes', 'No']));

});

app.intent('SR_Confirmation',function(conv,params, confirmation)
{
    var textToSpeech = ''; 
    var Items = {};   
    console.log("Confirmation===>",confirmation);

    if (confirmation.toLowerCase() == 'yes') 
    {
        return new Promise( function( resolve, reject )
        {
            GetSelectedCatalogDetailsListCall(conv.data.catalogID, function (SelectedCatalogDetailsListArr)
            {
                console.log(SelectedCatalogDetailsListArr);
                if (SelectedCatalogDetailsListArr.length == 0)
                {
                    conv.data.category = "";
                    conv.contexts.set('identify_SR',1);
                    conv.contexts.set('identify_incident',1);
                    textToSpeech = "I am afraid to tell that the requested entity is not found in the list. I may be wrong. Hence, kindly request you to be more specific regarding your request so that I can help you with it."; 
                    conv.ask(textToSpeech);
                    resolve();
                }
                else
                {               
                    conv.data.questions = SelectedCatalogDetailsListArr;
                    var startStr = "Please provide me the following details to complete your request. ";
                    console.log("Questions List ===>",conv.data.questions);
                    if (conv.data.questions.length > 0)
                    {
                        if (conv.data.questions[0].attrType === 'DropdownList')
                        {
                            console.log("inside if to ask dropdown question")
                            //to list out the dropdown values
                            var listValuesString = '';
                            for (var i = 0; i < conv.data.questions[0].dropdownlist.length; i++)
                            {
                                if(i == (conv.data.questions[0].dropdownlist.length-1))
                                {
                                    listValuesString += conv.data.questions[0].dropdownlist[i].ListValue;
                                }
                                else
                                {
                                    listValuesString += conv.data.questions[0].dropdownlist[i].ListValue + ', ';                    
                                }  
                            }
                
                            textToSpeech = startStr +'I have found ' + conv.data.questions[0].dropdownlist.length + " variants under " + conv.data.questions[0].attrName + ". Such as " + listValuesString + '. Which one do you want?';
                            conv.contexts.set('User_Answer',1);
                            for (var i = 0; i < conv.data.questions[0].dropdownlist.length; i++)
                            {
                                Items[conv.data.questions[0].dropdownlist[i].ListValue] = {};
                                Items[conv.data.questions[0].dropdownlist[i].ListValue].title = conv.data.questions[0].dropdownlist[i].ListValue;
                                //Items[i].description = conv.data.questions[0].dropdownlist[i].ListValue;          
                            }
                            console.log("Items List====>",Items);
                            if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                            {
                                console.log("Voice Device");
                                conv.contexts.set('User_Answer',1);
                                conv.ask(textToSpeech); 
                                resolve();
                            }
                            if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                            {    
                                console.log("Phone Surface");               
                                conv.contexts.set('User_Answer',1);
                                conv.ask(textToSpeech); 
                                //Create a list
                                conv.ask(new List({
                                    title: 'Please specify the '+ conv.data.questions[0].attrName,
                                    items: Items
                                }));
                                resolve();
                            }
                        }
                        else if (conv.data.questions[0].attrType === 'Date')
                        {
                            textToSpeech = startStr +'Please specify the ' + conv.data.questions[0].attrName + ' in "DDMMYYYY" format.';
                            console.log("Speech: " + textToSpeech);
                            conv.contexts.set('User_Answer',1);
                            //const contexts = conv.contexts;
                            //console.log('Contexts Set====>',contexts);  
                            conv.ask(textToSpeech);
                            resolve();
                        }
                        else if (conv.data.questions[0].attrType === 'TextBox' || conv.data.questions[0].attrType === 'TextArea')
                        {
                            textToSpeech = startStr + 'Please enter the ' + conv.data.questions[0].attrName;
                            console.log("Speech: " + textToSpeech);
                            conv.contexts.set('User_Answer',1);  
                            conv.ask(textToSpeech);
                            resolve();
                        }
                        else
                        {
                            conv.contexts.set('User_Answer',1);
                            conv.ask(new SimpleResponse({
                                speech: 'Please reply with OK to move to next input.',
                                text: 'Please reply with OK to move to next input.',
                            }),new Suggestions('OK'));
                            resolve();
                        }
                     
                    }

                }

            })
        }); 
    } 
    else 
    {
        conv.data.category = "";
        conv.contexts.set('end_conversation',1);
        textToSpeech = 'Sure, I abide by your command.';
        conv.ask(textToSpeech);
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you?',
            text: 'Is there something else do you want me to assist you?',
        }),new Suggestions(['Yes', 'No']));
    }
 
})

app.intent('AskQuestions_ReadAnswers_CreateSR',function (conv, params, option) 
{
    console.log('Inside User Answer====>');
    var userAnswer = '';
    var isAnswerAccepted;
    if(option)
    {
        userAnswer = option;
    }
    else
    {
        userAnswer = conv.parameters['User_Answer'];
    }    
    //var questions = [];
    var userID = '';
    var userName = '';
    var tempArray = [];
    var answerArray = [];
    var subjsonArr = [];
    var textToSpeech = '';
    var displayText = "";
    var categoryName = conv.data.categoryName;
    var categoryID = conv.data.categoryID;
    var catalogName = conv.data.catalogName;
    var catalogID = conv.data.catalogID;
    console.log("User Answer===>",userAnswer);
    console.log("UserID====>",conv.data.userID);
    
    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;   
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }
    if(conv.data.userName != '')
    {
        userName = conv.data.userName;
    }

    if(userAnswer != "")
    {
    
        if (conv.data.questions[0].attrType === 'DropdownList')
        {
            var listID = '';                           
            console.log("DropdownList====>", conv.data.questions[0].dropdownlist);

            for ( var i = 0; i < conv.data.questions[0].dropdownlist.length; i++)
            {
                if (userAnswer.toLowerCase().replace(/\s/g,'') === conv.data.questions[0].dropdownlist[i].ListValue.toLowerCase().replace(/\s/g,''))
                {
                    listID = conv.data.questions[0].dropdownlist[i].AttributeListID;
                }
            }
            if (listID === '')
            {
                isAnswerAccepted = 0;
                console.log("IsAnswerAccepted", isAnswerAccepted);
            }
            else
            {
                isAnswerAccepted = 1;
                conv.data.validOptionIteration = 0;
            }
            console.log("ListId", listID);

            if (isAnswerAccepted === 1)
            {
                subjsonArr.push({ "Attribute_Name": conv.data.questions[0].attrName, "Attribute_Type": conv.data.questions[0].attrType, "Attribute_Value": listID, "Attribute_ID": conv.data.questions[0].attrId });
                console.log("SubjsonArray===>", subjsonArr);
                if (conv.data.subjsonArr && conv.data.subjsonArr.length > 0)
                {
                    console.log("Inside IF SubJson");
                    tempArray = conv.data.subjsonArr;
                }
                else
                {
                    console.log("Inside Else SubJson");
                    conv.data.subjsonArr = subjsonArr;
                }
                if (typeof tempArray !== 'undefined' && tempArray.length > 0)
                {
                    tempArray.push.apply(tempArray, subjsonArr);
                    conv.data.subjsonArr = tempArray;
                }
                //console.log("TempArray===>", tempArray);
                console.log("Session Stored SubjsonArray===>", conv.data.subjsonArr);
            }
            else
            {
                            
                if (!conv.data.validOptionIteration || conv.data.validOptionIteration === 0)
                {
                    conv.data.validOptionIteration = 1;
                }
                else
                {
                    conv.data.validOptionIteration = conv.data.validOptionIteration + 1;
                }

                console.log("No of valid Iterations", conv.data.validOptionIteration);

                if (conv.data.validOptionIteration < 3)
                {
                    conv.contexts.set('User_Answer',1);
                    conv.ask("Not a valid option.");
                }
                else
                {

                    conv.data.validOptionIteration = 0;
                    conv.data.subjsonArr = {};
                    conv.contexts.set('end_conversation',1);
                    conv.ask("Sorry, could not create a Service Request.");
                    conv.ask(new SimpleResponse({
                        speech: 'Is there something else do you want me to assist you?',
                        text: 'Is there something else do you want me to assist you?',
                    }),new Suggestions(['Yes', 'No']));
                }
                                
            }

        }
        else if (conv.data.questions[0].attrType === 'TextBox' || conv.data.questions[0].attrType === 'TextArea')
        {
            isAnswerAccepted = 1;
            subjsonArr.push({ "Attribute_Name": conv.data.questions[0].attrName, "Attribute_Type": conv.data.questions[0].attrType, "Attribute_Value": userAnswer, "Attribute_ID": conv.data.questions[0].attrId });
            console.log("SubjsonArray===>", subjsonArr);
            console.log("Session Stored SubjsonArray===>", conv.data.subjsonArr);
            if (conv.data.subjsonArr && conv.data.subjsonArr.length > 0)
            {
                tempArray = conv.data.subjsonArr;
            }
            else
            {
                conv.data.subjsonArr = subjsonArr;
            }
            if (typeof tempArray !== 'undefined' && tempArray.length > 0)
            {
                tempArray.push.apply(tempArray, subjsonArr);
                conv.data.subjsonArr = tempArray;
            }                                                    
            //console.log("TempArray===>", tempArray);
            console.log("Session Stored SubjsonArray===>", conv.data.subjsonArr);
        }
        else if (conv.data.questions[0].attrType === 'Date')
        {
            isAnswerAccepted = 1;
            //User_Answer = app.getDateTime().date.year + '/' + app.getDateTime().date.month + '/' + app.getDateTime().date.day;
            subjsonArr.push({ "Attribute_Name": conv.data.questions[0].attrName, "Attribute_Type": conv.data.questions[0].attrType, "Attribute_Value": userAnswer, "Attribute_ID": conv.data.questions[0].attrId });
            console.log("SubjsonArray===>", subjsonArr);
            console.log("Session Stored SubjsonArray===>", conv.data.subjsonArr);
            if (conv.data.subjsonArr && conv.data.subjsonArr.length > 0)
            {
                tempArray = conv.data.subjsonArr;
            }
            else
            {
                conv.data.subjsonArr = subjsonArr;
            }
            if (typeof tempArray !== 'undefined' && tempArray.length > 0)
            {
                tempArray.push.apply(tempArray, subjsonArr);
                conv.data.subjsonArr = tempArray;
            }
            //console.log("TempArray===>", tempArray);
            console.log("Session Stored SubjsonArray===>", conv.data.subjsonArr);
        }
        else
        {
            isAnswerAccepted = 1;
            subjsonArr.push({ "Attribute_Name": conv.data.questions[0].attrName, "Attribute_Type": conv.data.questions[0].attrType, "Attribute_Value": "", "Attribute_ID": conv.data.questions[0].attrId });
            console.log("SubjsonArray===>", subjsonArr);
            console.log("Session Stored SubjsonArray===>", conv.data.subjsonArr);
            if (conv.data.subjsonArr && conv.data.subjsonArr.length > 0)
            {
                tempArray = conv.data.subjsonArr;
            }
            else
            {
                conv.data.subjsonArr = subjsonArr;
            }
            if (typeof tempArray !== 'undefined' && tempArray.length > 0)
            {
                tempArray.push.apply(tempArray, subjsonArr);
                conv.data.subjsonArr = tempArray;
            }
            //console.log("TempArray===>", tempArray);
            console.log("Session Stored SubjsonArray===>", conv.data.subjsonArr);
        
        }

        if (conv.data.questions.length >= 1 && isAnswerAccepted === 1)
        {
            //console.log("Going Inside");
            var tempQuestions = [];
            tempQuestions = conv.data.questions;
            conv.data.questions = tempQuestions.slice(1);
        }
        else
        {
                            
            if (conv.data.validOptionIteration >= 3)
            {
                console.log("Inside setting zero");
                conv.data.questions = {};                               
            }
        }

        if (conv.data.questions.length === 0 && isAnswerAccepted === 1)
        {
            LogServiceRequestCall(userID,userName,categoryName, categoryID, catalogName, catalogID, conv.data.subjsonArr, function (ticknum)
            {
                conv.data.category = "";
                conv.data.questions = {};
                conv.data.subjsonArr = {};
                conv.data.validOptionIteration = 0;
                console.log("Service Request No:", ticknum);
                if (ticknum == '')
                {
                    textToSpeech = "Sorry I could not log the service request. Please try again later.";
                    displayText = "Sorry I could not log the service request. Please try again later.";
                    conv.contexts.set('end_conversation',1);
                }
                else
                {
                    displayText = "I have raised a service request with the provided information and your service request ID is, " + ticknum + ".";
                    numberToDigit(ticknum, function (ticknum)
                    {
                        ticknum = "S R " + ticknum;
                        textToSpeech = "I have raised a service request with the provided information and your service request ID is, " + ticknum + ".";
                        conv.contexts.set('end_conversation',1);
                    })
                }
                console.log("Inside the method - TicketNo:", ticknum);
            })

             return asyncTask()
             .then(() => conv.ask(new SimpleResponse({
             speech: textToSpeech,
             text: displayText,
             }),new SimpleResponse({
             speech: 'Is there something else do you want me to assist you ?',
             text: 'Is there something else do you want me to assist you ?',
             }),new Suggestions(['Yes', 'No'])));
        }

    }

    if (conv.data.questions.length > 0 && isAnswerAccepted !== 0)
    {
            if (conv.data.questions[0].attrType === 'DropdownList')
            {
                var Items = {};
                console.log("inside if to ask dropdown question")
                //to list out the dropdown values
                var listValuesString = '';
                for (var i = 0; i < conv.data.questions[0].dropdownlist.length; i++)
                {
                    if(i == (conv.data.questions[0].dropdownlist.length-1))
                    {
                        listValuesString += conv.data.questions[0].dropdownlist[i].ListValue;
                    }
                    else
                    {
                        listValuesString += conv.data.questions[0].dropdownlist[i].ListValue + ', ';                    
                    }                    
                }
                for (var i = 0; i < conv.data.questions[0].dropdownlist.length; i++)
                {
                    Items[conv.data.questions[0].dropdownlist[i].ListValue] = {};
                    Items[conv.data.questions[0].dropdownlist[i].ListValue].title = conv.data.questions[0].dropdownlist[i].ListValue;
                   // Items[i].description = conv.data.questions[0].dropdownlist[i].ListValue;          
                }   
                textToSpeech = ' I have found ' + conv.data.questions[0].dropdownlist.length + " variants under " + conv.data.questions[0].attrName + ". Such as " + listValuesString + '. Which one do you want?';
                console.log("Items List====>",Items);
          
                if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    console.log("Voice Device");
                    conv.contexts.set('User_Answer',1);
                    conv.ask(textToSpeech); 
                }
                if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {    
                    console.log("Phone Surface");               
                    conv.contexts.set('User_Answer',1);
                    conv.ask(textToSpeech); 
                     //Create a list
                    conv.ask(new List({
                        title: 'Please specify the '+conv.data.questions[0].attrName,
                        items: Items
                    }));
                }
            }
            else if (conv.data.questions[0].attrType === 'Date')
            {
                textToSpeech = 'Please specify the ' + conv.data.questions[0].attrName + ' in "DDMMYYYY" format.';
                console.log("Speech: " + textToSpeech);
                conv.contexts.set('User_Answer',1);
                //const contexts = conv.contexts;
                //console.log('Contexts Set====>',contexts);
                conv.ask(textToSpeech); 
            }
            else if (conv.data.questions[0].attrType === 'TextBox' || conv.data.questions[0].attrType === 'TextArea')
            {
                textToSpeech = 'Please enter the ' + conv.data.questions[0].attrName;
                console.log("Speech: " + textToSpeech);
                conv.contexts.set('User_Answer',1);
                conv.ask(textToSpeech);   
            } 
            else
            {
                conv.contexts.set('User_Answer',1);
                conv.ask(new SimpleResponse({
                    speech: 'Please reply with OK to move to next input.',
                    text: 'Please reply with OK to move to next input.',
                }),new Suggestions('OK'));
            }

    }

})

app.intent('Know_Status_WithID',function(conv)
{
    console.log("Inside Web Status Service call ====>");
    var userID = '';
    var noOfTickets = 10;
    var resolvedQuery =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var ticketNumber = conv.parameters['number'];
    var incidentNumber = '';
    var incidentStatus = '';
    var incidentSymptom = '';
    var incidentCreatedDateTime = ''; 
    var srNumber = '';
    var srStatus = '';
    var srCreateDateTime = '';
    var srDescription = '';
    var textToSpeech = '';
    var displayText = '';
    conv.data.IncidentNumber ='';
    conv.data.IncidentStatus = '';
    conv.data.SRNumber = '';
    conv.data.SRStatus = '';


    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }

    console.log("Ticket Number===>",ticketNumber);

    return new Promise(function(resolve,reject)
    {
        GetTicketDetails(userID,noOfTickets,ticketNumber,function(ticketDetailsArray)
        {
            if(ticketDetailsArray.length > 0)
            {
                if(ticketDetailsArray[0] != "")
                {
                    console.log(ticketDetailsArray[0]);
                    incidentNumber = ticketDetailsArray[0].IncidentNumber;
                    incidentStatus = ticketDetailsArray[0].IncidentStatus;
                    incidentSymptom = ticketDetailsArray[0].IncidentDescription;
                    incidentCreatedDateTime = ticketDetailsArray[0].IncidentCreatedDate;   
                    conv.data.IncidentNumber = ticketDetailsArray[0].IncidentNumber;
                    conv.data.IncidentStatus = ticketDetailsArray[0].IncidentStatus;
                }
                if(ticketDetailsArray[1] != "")
                {
                    console.log(ticketDetailsArray[1]);
                    srNumber = ticketDetailsArray[1].SRNumber; 
                    srStatus =  ticketDetailsArray[1]. SRStatus; 
                    srCreateDateTime = ticketDetailsArray[1].SRCreatedDate;
                    srDescription = ticketDetailsArray[1].SRDescritpion; 
                    conv.data.SRNumber = ticketDetailsArray[1].SRID; 
                    conv.data.SRStatus =  ticketDetailsArray[1]. SRStatus; 
                }            
            }
            if(incidentNumber != "")
            {
                if(incidentStatus.toLowerCase() == "new" || incidentStatus.toLowerCase() == "assigned" || incidentStatus.toLowerCase() == "in-progress" || incidentStatus.toLowerCase() == "pending")
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident.';
                        conv.contexts.set('update_open_incident', 1);
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Symptom: ' + incidentSymptom,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + incidentStatus + ',' + ' Logged Time: ' + incidentCreatedDateTime,
                            title: 'Ticket ID: ' + incidentNumber,
                        }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'Cancel the Incident', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        conv.contexts.set('update_open_incident', 1);
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident for, ' + incidentSymptom + '. ' + 'The ticket number of the incident is ' + incidentNumber + '. ' + 'and the incident was logged at' + incidentCreatedDateTime + '. ' + 'We can carry out many actions related to the incident. Such as Provide Updates, Remind the Analyst, Escalate, Cancel the Incident and No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }

                }
                if(incidentStatus.toLowerCase() == "resolved" || incidentStatus.toLowerCase() == "closed" || incidentStatus.toLowerCase() == "cancelled")                   
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident';
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Symptom: ' + incidentSymptom,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + incidentStatus + ',' + ' Logged Time: ' + incidentCreatedDateTime,
                            title: 'Ticket ID: ' + incidentNumber,
                        }), new Suggestions(['Provide feedback', 'Reopen', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident for, ' + incidentSymptom + '. ' + 'The ticket number of the incident is ' + incidentNumber + '. ' + 'and the incident was logged at' + incidentCreatedDateTime + '. ' + 'We can carry out many actions related to the incident. Such as Provide feedback, Reopen and No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }

                }  

            }
            if(srNumber != "")
            {
                if(srStatus.toLowerCase() == "new" || srStatus.toLowerCase() == "assigned" || srStatus.toLowerCase() == "in-progress" || srStatus.toLowerCase() == "pending")
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the Service Request';
                        conv.contexts.set('update_open_SR', 1);
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Description: ' + srDescription,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + srStatus + ',' + ' Logged Time: ' + srCreateDateTime,
                            title: 'Ticket ID: ' + srNumber,
                        }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        conv.contexts.set('update_open_SR', 1);
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request for, ' + srDescription + '. ' + 'The ticket number of the Service Request is ' + srNumber + '. ' + 'and the Service Request was logged at' + srCreateDateTime + '. ' + 'We can carry out many actions related to the Service Request. Such as Provide Updates, Remind the Analyst, Escalate and No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }

                }
                if(srStatus.toLowerCase() == "resolved" || srStatus.toLowerCase() == "closed" || srStatus.toLowerCase() == "cancelled")                   
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the Service Request.';
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Description: ' + srDescription,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + srStatus + ',' + ' Logged Time: ' + srCreateDateTime,
                            title: 'Ticket ID: ' + srNumber,
                        }), new Suggestions(['Provide feedback', 'Reopen', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request for, ' + srDescription + '. ' + 'The ticket number of the Service Request is ' + srNumber + '. ' + 'and the incident was logged at' + srCreateDateTime + '. ' + 'We can carry out many actions related to the Service Request. Such as Provide feedback, Reopen and No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        resolve();
                    }

                }  

            }
            if(incidentNumber == "" && srNumber == "")
            {
                textToSpeech = 'I suppose the Incident/S R '+ ticketNumber + ' is not logged by you. Hence  I am not authorised to share the details with you. Kindly request you to provide specific keyword. Thank you.';
                conv.contexts.set('identify_SR',1);
                conv.contexts.set('identify_incident',1);
                conv.contexts.set('identify_status',1);
                conv.contexts.set('Last_Incident_Status',1);
                conv.contexts.set('Last_SR_Status',1);
                conv.contexts.set('Last_week_incident',1);
                conv.contexts.set('Last_week_SR',1);
                conv.ask(textToSpeech);  
                console.log("textToSpeech",textToSpeech);
                resolve();
            }
            else if(incidentNumber != "" && srNumber != "")
            {
                textToSpeech = 'Kindly request you to specify whether you would like to know about Incident or Request.' 
                conv.ask(textToSpeech);  
                console.log("textToSpeech",textToSpeech);
                resolve();           
            }
        })
    })   
});

app.intent('Update_Open_Incidents',function(conv)
{
    var resolvedQuery =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var textToSpeech = '';
    console.log("Resolved Query====>",resolvedQuery);

    if(resolvedQuery.toLowerCase() == 'provide updates')
    {
        textToSpeech = 'Please provide additional information';
        conv.contexts.set('open_incident_confirmation',1);
        conv.data.incidentUpdateType = 'update';
        conv.ask(textToSpeech);
    }
    else if(resolvedQuery.toLowerCase() == 'remind the analyst')
    {
        var remainderComment = 'User has remainded : Please resolve this incident as soon as possible.';

        return new Promise( function( resolve, reject )
        {
            UpdateIncident(conv.data.IncidentNumber,conv.data.userID,conv.data.IncidentStatus,remainderComment,function(OutputJSON)
            {
                if(OutputJSON.Message == 'Ticket details are updated successfully')
                {
                    textToSpeech = 'A reminder has been sent to the Analyst to resolve your incident as soon as possible. The Analyst will contact you in case any updates are required. ';
                    conv.contexts.set('end_conversation',1);
                    conv.data.incidentUpdateType = 'remind';
                    conv.ask(textToSpeech);
                    conv.ask(new SimpleResponse({
                        speech: 'Is there something else do you want me to assist you ?',
                        text: 'Is there something else do you want me to assist you ?',
                    }),new Suggestions(['Yes', 'No'])); 
                    resolve();
                }           
            })
        })
  
    }
    else if(resolvedQuery.toLowerCase() == 'escalate')
    {
        textToSpeech = 'I understand the resolution of this incident is important for you and hence you want to escalate. Please confirm - Yes/No.';
        conv.contexts.set('open_incident_confirmation',1);
        conv.data.incidentUpdateType = 'escalate';
        conv.ask(new SimpleResponse({
            speech: textToSpeech,
            text: textToSpeech,
        }),new Suggestions(['Yes', 'No']));   

    }
    else if(resolvedQuery.toLowerCase() == 'no action required')
    {
        conv.contexts.set('end_conversation',1);
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you ?',
            text: 'Is there something else do you want me to assist you ?',
        }),new Suggestions(['Yes', 'No'])); 
    }
    else if(resolvedQuery.toLowerCase() == 'cancel the incident')
    {
        textToSpeech = 'I understand that the incident has been resolved at your end. Hence, you want to cancel the incident. Please confirm - Yes/No.'
        conv.contexts.set('open_incident_confirmation',1);
        conv.data.incidentUpdateType = 'cancel';
        conv.ask(new SimpleResponse({
            speech: textToSpeech,
            text: textToSpeech,
        }),new Suggestions(['Yes', 'No']));     
    }
    else
    {
        textToSpeech = 'I have trouble understanding your response. Please enter any one of the below options:';
        conv.contexts.set('update_open_incident',1);
        conv.ask(new SimpleResponse({
            speech: textToSpeech,
            text: textToSpeech,
        }),new Suggestions(['Provide Updates', 'Remind the Analyst','Escalate','Cancel the Incident'])); 
    
    }

});

app.intent('Open_Incident_Confirmation',function(conv)
{

    var resolvedQuery =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var textToSpeech = '';
    if(conv.data.incidentUpdateType == 'update')
    {
        return new Promise( function( resolve, reject )
        {
            UpdateIncident(conv.data.IncidentNumber,conv.data.userID,conv.data.IncidentStatus,resolvedQuery,function(OutputJSON)
            {
                if(OutputJSON.Message == 'Ticket details are updated successfully')
                {
                    textToSpeech = 'Thank you for providing the information. The incident has been successfully updated. ';
                    conv.contexts.set('end_conversation',1);
                    conv.ask(textToSpeech);
                    conv.ask(new SimpleResponse({
                        speech: 'Is there something else do you want me to assist you ?',
                        text: 'Is there something else do you want me to assist you ?',
                    }),new Suggestions(['Yes', 'No']));  
                    resolve();
                } 
            })
        })
     
    }
    if(conv.data.incidentUpdateType == 'escalate')
    {
        if(resolvedQuery.toLowerCase() == 'yes')
        {
            var escalationComment = 'User has escalated : Please resolve this incident as soon as possible.';

            return new Promise( function( resolve, reject )
            {
                UpdateIncident(conv.data.IncidentNumber,conv.data.userID,conv.data.IncidentStatus,escalationComment,function(OutputJSON)
                {
                    if(OutputJSON.Message == 'Ticket details are updated successfully')
                    {
                        textToSpeech = 'The incident has been escalated successfully. Expecting a speedy resolution of this incident! ';
                        conv.contexts.set('end_conversation',1);
                        conv.ask(textToSpeech);
                        conv.ask(new SimpleResponse({
                            speech: 'Is there something else do you want me to assist you ?',
                            text: 'Is there something else do you want me to assist you ?',
                        }),new Suggestions(['Yes', 'No'])); 
                        resolve();
                    }           
                })
            })

        }
        else
        {
            conv.contexts.set('end_conversation',1);
            conv.ask(new SimpleResponse({
                speech: 'Is there something else do you want me to assist you ?',
                text: 'Is there something else do you want me to assist you ?',
            }),new Suggestions(['Yes', 'No'])); 
        
        }    
    }
    if(conv.data.incidentUpdateType == 'cancel')
    {
        if(resolvedQuery.toLowerCase() == 'yes')
        {
            textToSpeech = 'Okay, could you please let me know the reason for cancellation. I like to learn about different solutions to a problem.';
            conv.data.cancelIncidentConfirmation = 'yes';
            conv.contexts.set('cancel_open_incident',1);
            conv.ask(textToSpeech);
        }
        else
        {
            conv.data.cancelIncidentConfirmation = 'no';
            conv.contexts.set('end_conversation',1);
            conv.ask(new SimpleResponse({
                speech: 'Is there something else do you want me to assist you ?',
                text: 'Is there something else do you want me to assist you ?',
            }),new Suggestions(['Yes', 'No'])); 
        
        }  
    }
})

app.intent('Cancel_Open_Incidents',function(conv)
{
    var resolvedQuery =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var textToSpeech = '';

    console.log("Resolved Query===>",resolvedQuery);

    if(conv.data.incidentUpdateType.toLowerCase() == 'cancel' && conv.data.cancelIncidentConfirmation == 'yes')
    {
        console.log('Inside Cancel');
        return new Promise( function( resolve, reject )
        {
            CancelIncident(conv.data.IncidentNumber,conv.data.userID,resolvedQuery,function(OutputJSON)
            {
                if(OutputJSON.Message == 'Ticket details are updated successfully')
                {
                    textToSpeech = 'The incident has been cancelled successfully, as desired by you. ';
                    conv.contexts.set('end_conversation',1);
                    conv.ask(textToSpeech);
                    conv.ask(new SimpleResponse({
                        speech: 'Is there something else do you want me to assist you ?',
                        text: 'Is there something else do you want me to assist you ?',
                    }),new Suggestions(['Yes', 'No']));   
                    resolve();
                }        
            })
        })
   
    }
})

app.intent('Update_Open_SRs',function(conv)
{
    var resolvedQuery =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var textToSpeech = '';
    console.log("Resolved Query====>",resolvedQuery);

    if(resolvedQuery.toLowerCase() == 'provide updates')
    {
        textToSpeech = 'Please provide additional information';
        conv.contexts.set('open_SR_confirmation',1);
        conv.data.incidentUpdateType = 'update';
        conv.ask(textToSpeech);
    }
    else if(resolvedQuery.toLowerCase() == 'remind the analyst')
    {

        var remainderComment = 'User has reminded : Please resolve this SR as soon as possible.';
        return new Promise( function( resolve, reject )
        {
            UpdateServiceRequest(conv.data.SRNumber,conv.data.userID,remainderComment,function(OutputJSON)
            {
                if(OutputJSON.Message == 'Successfully saved the service request.')
                {
                    console.log("inside if block");
                    textToSpeech = 'A reminder has been sent to the Analyst to resolve your SR as soon as possible. The Analyst will contact you in case any updates are required.';
                    conv.contexts.set('end_conversation',1);
                    conv.data.incidentUpdateType = 'remind';
                    conv.ask(textToSpeech);
                    conv.ask(new SimpleResponse({
                        speech: 'Is there something else do you want me to assist you ?',
                        text: 'Is there something else do you want me to assist you ?',
                    }),new Suggestions(['Yes', 'No']));    
                    resolve();
                }        
            }) 
        })
 
    }
    else if(resolvedQuery.toLowerCase() == 'escalate')
    {
        textToSpeech = 'I understand the resolution of this SR is important for you and hence you want to escalate. Please confirm - Yes/No.';
        conv.contexts.set('open_SR_confirmation',1);
        conv.data.incidentUpdateType = 'escalate';
        conv.ask(new SimpleResponse({
            speech: textToSpeech,
            text: textToSpeech,
        }),new Suggestions(['Yes', 'No']));   

    }
    else if(resolvedQuery.toLowerCase() == 'no action required')
    {
        conv.contexts.set('end_conversation',1);
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you ?',
            text: 'Is there something else do you want me to assist you ?',
        }),new Suggestions(['Yes', 'No'])); 
    }
    else
    {
        textToSpeech = 'I have trouble understanding your response. Please enter any one of the below options:';
        conv.contexts.set('update_open_SR',1);
        conv.ask(new SimpleResponse({
            speech: textToSpeech,
            text: textToSpeech,
        }),new Suggestions(['Provide Updates', 'Remind the Analyst','Escalate'])); 
    
    }

});

app.intent('Open_SR_Confirmation',function(conv)
{

    var resolvedQuery =  conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
    var textToSpeech = '';
    if(conv.data.incidentUpdateType == 'update')
    {
        return new Promise( function( resolve, reject )
        {
            UpdateServiceRequest(conv.data.SRNumber,conv.data.userID,resolvedQuery,function(OutputJSON)
            {
                console.log("Output JSON====>",OutputJSON);
                if(OutputJSON.Message == 'Successfully saved the service request.')
                {
                    console.log("inside if block");
                    textToSpeech = 'Thank you for providing the information. The SR has been successfully updated. ';
                    conv.contexts.set('end_conversation',1);
                    conv.ask(textToSpeech);
                    conv.ask(new SimpleResponse({
                        speech: 'Is there something else do you want me to assist you ?',
                        text: 'Is there something else do you want me to assist you ?',
                    }),new Suggestions(['Yes', 'No']));    
                    resolve();
                }        
            }) 
        })
    }

    if(conv.data.incidentUpdateType == 'escalate')
    {
        if(resolvedQuery.toLowerCase() == 'yes')
        {
            var escalationComment = 'User has escalated : Please resolve this SR as soon as possible.';
            return new Promise( function( resolve, reject )
            {
                UpdateServiceRequest(conv.data.SRNumber,conv.data.userID,escalationComment,function(OutputJSON)
                {
                    console.log("Output JSON====>",OutputJSON);
                    if(OutputJSON.Message == 'Successfully saved the service request.')
                    {
                        console.log("inside if block");
                        textToSpeech = 'The SR has been escalated successfully. Expecting a speedy resolution of this SR! ';
                        conv.contexts.set('end_conversation',1);
                        conv.ask(textToSpeech);
                        conv.ask(new SimpleResponse({
                            speech: 'Is there something else do you want me to assist you ?',
                            text: 'Is there something else do you want me to assist you ?',
                        }),new Suggestions(['Yes', 'No']));    
                        resolve();
                    }        
                }) 
            })
        }
        else
        {
            conv.contexts.set('end_conversation',1);
            conv.ask(new SimpleResponse({
                speech: 'Is there something else do you want me to assist you ?',
                text: 'Is there something else do you want me to assist you ?',
            }),new Suggestions(['Yes', 'No'])); 
        
        }    
    }
})

app.intent('Know_Status_Of_LastIncident',function(conv)
{
    console.log('Last Incident Intent');

    var userID = '';
    var noOfTickets = 1;
    var textToSpeech = '';
    var incidentNumber = '';
    var incidentStatus = '';
    var incidentSymptom = '';
    var incidentCreatedDateTime = ''; 

    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }
    return new Promise(function(resolve,reject)
    {
        GetIncidentDetails(userID,noOfTickets,function(IncidentDetailsArr)
        {
            console.log("Incident Details Array==>",IncidentDetailsArr);
            if(IncidentDetailsArr.length > 0 )
            {
                incidentNumber = IncidentDetailsArr[0].Incident_ID;
                incidentStatus = IncidentDetailsArr[0].Status;
                incidentSymptom = IncidentDetailsArr[0].Symptom;
                incidentCreatedDateTime = IncidentDetailsArr[0].Logged_Time;   
                conv.data.IncidentNumber = IncidentDetailsArr[0].Incident_ID;
                conv.data.IncidentStatus = IncidentDetailsArr[0].Status;
           
                if(incidentStatus.toLowerCase() == "new" || incidentStatus.toLowerCase() == "assigned" || incidentStatus.toLowerCase() == "in-progress" || incidentStatus.toLowerCase() == "pending")
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident.';
                        conv.contexts.set('update_open_incident', 1);
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Symptom: ' + incidentSymptom,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + incidentStatus + ',' + ' Logged Time: ' + incidentCreatedDateTime,
                            title: 'Ticket ID: ' + incidentNumber,
                        }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'Cancel the Incident', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        conv.contexts.set('update_open_incident', 1);
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident for, ' + incidentSymptom + '. ' + 'The ticket number of the incident is ' + incidentNumber + '. ' + 'and the incident was logged at' + incidentCreatedDateTime + '. ' + 'We can carry out many actions related to the incident. Such as Provide Updates, Remind the Analyst, Escalate, Cancel the Incident and No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }

                }
                if(incidentStatus.toLowerCase() == "resolved" || incidentStatus.toLowerCase() == "closed" || incidentStatus.toLowerCase() == "cancelled")                   
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident';
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Symptom: ' + incidentSymptom,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + incidentStatus + ',' + ' Logged Time: ' + incidentCreatedDateTime,
                            title: 'Ticket ID: ' + incidentNumber,
                        }), new Suggestions(['Provide feedback', 'Reopen', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + incidentStatus + ' incident for, ' + incidentSymptom + '. ' + 'The ticket number of the incident is ' + incidentNumber + '. ' + 'and the incident was logged at' + srCreateDateTime + '. ' + 'We can carry out many actions related to the incident. Such as Provide feedback, Reopen, No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }

                } 
            }
            else
            {
                textToSpeech = 'There are no incidents matching this criteria. It would be great if you could question me in a more concise manner.';
                conv.contexts.set('identify_SR',1);
                conv.contexts.set('identify_incident',1);
                conv.contexts.set('identify_status',1);
                conv.contexts.set('Last_Incident_Status',1);
                conv.contexts.set('Last_SR_Status',1);
                conv.contexts.set('Last_week_incident',1);
                conv.contexts.set('Last_week_SR',1); 
                conv.ask(textToSpeech); 
                resolve();
            }
    
        })
    })

})

app.intent('Know_Status_Of_LastSR',function(conv)
{
    console.log('Last Incident Intent');
    var userID = '';
    var noOfTickets = 1;
    var textToSpeech = '';
    var srNumber = '';
    var srStatus = '';
    var srCreateDateTime = '';
    var srDescription = '';

    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }
    return new Promise(function(resolve,reject)
    {
    
        GetSRDetails(userID,noOfTickets,function(SRDetailsArr)
        {        
            console.log("SR Details Array==>",SRDetailsArr);
            if(SRDetailsArr.length > 0)
            {
            
                srNumber = SRDetailsArr[0].Ticket_No; 
                srStatus =  SRDetailsArr[0]. Status; 
                srCreateDateTime = SRDetailsArr[0].Reg_Time;
                srDescription = SRDetailsArr[0].Description; 
                conv.data.SRNumber = SRDetailsArr[0].Ticket_ID; 
                conv.data.SRStatus =  SRDetailsArr[0]. Status; 

                if(srStatus.toLowerCase() == "new" || srStatus.toLowerCase() == "assigned" || srStatus.toLowerCase() == "in-progress" || srStatus.toLowerCase() == "pending")
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the Service Request';
                        conv.contexts.set('update_open_SR', 1);
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Description: ' + srDescription,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + srStatus + ',' + ' Logged Time: ' + srCreateDateTime,
                            title: 'Ticket ID: ' + srNumber,
                        }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        conv.contexts.set('update_open_SR', 1);
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request for, ' + srDescription + '. ' + 'The ticket number of the Service Request is ' + srNumber + '. ' + 'and the incident was logged at' + srCreateDateTime + '. ' + 'We can carry out many actions related to the Service Request. Such as Provide Updates, Remind the Analyst, Escalate and No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        resolve();
                    }

                }
                if(srStatus.toLowerCase() == "resolved" || srStatus.toLowerCase() == "closed")                   
                {
                    if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the Service Request';
                        conv.ask(textToSpeech);
                        // Create a basic card
                        conv.ask(new BasicCard({
                            text: 'Description: ' + srDescription,
                            // a line break to be rendered in the card.
                            subtitle: 'Status: ' + srStatus + ',' + ' Logged Time: ' + srCreateDateTime,
                            title: 'Ticket ID: ' + srNumber,
                        }), new Suggestions(['Provide feedback', 'Reopen', 'No Action Required']));
                        console.log("textToSpeech", textToSpeech);
                        resolve();
                    }
                    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                    {
                        textToSpeech = 'There is 1 ' + srStatus + ' Service Request for, ' + srDescription + '. ' + 'The ticket number of the Service Request is ' + srNumber + '. ' + 'and the incident was logged at' + srCreateDateTime + '. ' + 'We can carry out many actions related to the Service Request. Such as Provide feedback, Reopen and No Action Required. Which one do you want? ';
                        conv.ask(textToSpeech);
                        resolve();
                    }

                }  
            
            }
            else
            {
            
                textToSpeech = 'There are no SRs matching this criteria. It would be great if you could question me in a more concise manner.';
                conv.contexts.set('identify_SR',1);
                conv.contexts.set('identify_incident',1);
                conv.contexts.set('identify_status',1);
                conv.contexts.set('Last_Incident_Status',1);
                conv.contexts.set('Last_SR_Status',1);
                conv.contexts.set('Last_week_incident',1);
                conv.contexts.set('Last_week_SR',1); 
                conv.ask(textToSpeech); 
                resolve();
            
            }
        
        })
    })
})

app.intent('Know_Status_Of_LastWeekIncident',function(conv)
{
    var lastWeek = '';
    var startDate = '';
    var endDate = '';
    var userID = '';
    var noOfTickets = 10;
    var textToSpeech = '';
    var displayText = '';
    var listValuesString = '';
    conv.data.IncidentNumber ='';
    conv.data.IncidentStatus = '';
    
    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }
    console.log('UserID====>',userID);
    if(conv.parameters['date-period'] != '')
    {
        lastWeek = conv.parameters['date-period'];
        startDate = new Date(lastWeek.startDate).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        endDate = new Date(lastWeek.endDate).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }
    if(conv.parameters['date'] != '')
    {
        startDate = new Date(conv.parameters['date']);
        endDate  = new Date(conv.parameters['date']);
        endDate.setHours(startDate.getHours() + 24);
        startDate = new Date(conv.parameters['date']).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        endDate  = new Date(endDate).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }

    //var newDate1 = date.parse(sample1,'YYYY/MM/DD HH:mm:ss',true);

    console.log('startDate===>',startDate);
    console.log('endDate===>',endDate);

    return new Promise(function(resolve,reject)
    {
        GetIncidentDetails(userID,noOfTickets,function(IncidentDetailsArr)
        {
            var slicedIncidentDetailsArr = [];           
            if(IncidentDetailsArr.length > 0)
            {
                if(conv.parameters['date-period'] != '' || conv.parameters['date'] != '' )
                {
                    for (var i = 0; i < IncidentDetailsArr.length; i++)
                    {
                        if(IncidentDetailsArr[i].Logged_Time > startDate && IncidentDetailsArr[i].Logged_Time < endDate)
                        {
                            console.log("Inside IF====>");
                            console.log("Logged Time===>",IncidentDetailsArr[i].Logged_Time);
                            slicedIncidentDetailsArr.push(IncidentDetailsArr[i]);
                        }                    
                    }                
                }
     
            }

            console.log("Sliced Array===>",slicedIncidentDetailsArr);
            console.log("Incident Details Array===>",IncidentDetailsArr);

            if(slicedIncidentDetailsArr.length > 1)
            {            
                var Items = {};
                for (var i = 0; i < slicedIncidentDetailsArr.length; i++)
                {
                    Items[slicedIncidentDetailsArr[i].Incident_ID] = {};
                    Items[slicedIncidentDetailsArr[i].Incident_ID].title = 'Ticket ID: '+ slicedIncidentDetailsArr[i].Incident_ID;
                    Items[slicedIncidentDetailsArr[i].Incident_ID].description = 'Status: ' + slicedIncidentDetailsArr[0].Status + ',' + ' Logged Time: ' + slicedIncidentDetailsArr[0].Logged_Time + ',' + ' Symptom: ' + slicedIncidentDetailsArr[0].Symptom; 
                    listValuesString += slicedIncidentDetailsArr[i].Incident_ID + ', ';
                }

                if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    textToSpeech = 'There are ' + slicedIncidentDetailsArr.length + ' incidents. Below are the details. Select the incident if you wish to carry out any specific actions. If the desired incident is not listed below, request you to provide specific details so that I can help you with the right details';
                    conv.contexts.set('get_incident_details', 1);
                    conv.ask(new SimpleResponse({
                        speech: textToSpeech,
                        text: displayText,
                    }));
                    //Create a list
                    conv.ask(new List({
                        title: 'List of Incidents',
                        items: Items,
                    }), new Suggestions('No Action Required'));
                    resolve();
                }
                if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    textToSpeech = 'There are ' + slicedIncidentDetailsArr.length + ' incidents. And the ticket number of the incidents are ' + listValuesString + '. Which one would you like to know more about?';
                    conv.contexts.set('get_incident_details', 1);
                    conv.ask(textToSpeech);
                    resolve();
                }

            }
            else if (slicedIncidentDetailsArr.length == 1)
            {

                conv.data.IncidentNumber = slicedIncidentDetailsArr[0].Incident_ID;
                conv.data.IncidentStatus = slicedIncidentDetailsArr[0].Status;

                if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    textToSpeech = 'There is 1 ' + slicedIncidentDetailsArr[0].Status + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident.';
                    conv.contexts.set('update_open_incident', 1);
                    conv.ask(textToSpeech);
                    // Create a basic card
                    conv.ask(new BasicCard({
                        text: 'Symptom: ' + slicedIncidentDetailsArr[0].Symptom,
                        // a line break to be rendered in the card.
                        subtitle: 'Status: ' + slicedIncidentDetailsArr[0].Status + ',' + ' Logged Time: ' + slicedIncidentDetailsArr[0].Logged_Time,
                        title: 'Ticket ID: ' + slicedIncidentDetailsArr[0].Incident_ID,
                    }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'Cancel the Incident', 'No Action Required']));
                    resolve();
                }
                if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    conv.contexts.set('update_open_incident', 1);
                    textToSpeech = 'There is 1 ' + slicedIncidentDetailsArr[0].Status + ' incident for, ' + slicedIncidentDetailsArr[0].Symptom + '. ' + 'The ticket number of the incident is ' + slicedIncidentDetailsArr[0].Incident_ID + '. ' + 'and the incident was logged at' + slicedIncidentDetailsArr[0].Logged_Time + '. ' + 'We can carry out many actions related to the incident. Such as Provide Updates, Remind the Analyst, Escalate, Cancel the Incident and No Action Required. Which one do you want? ';
                    conv.ask(textToSpeech);
                    console.log("textToSpeech", textToSpeech);
                    resolve();
                }

            }
            else
            {
                conv.contexts.set('identify_SR',1);
                conv.contexts.set('identify_incident',1);
                conv.contexts.set('identify_status',1);
                conv.contexts.set('Last_Incident_Status',1);
                conv.contexts.set('Last_SR_Status',1);
                conv.contexts.set('Last_week_incident',1); 
                conv.contexts.set('Last_week_SR',1); 
                conv.ask('There are no incidents matching this criteria. It would be great if you could question me in a more concise manner.'); 
                resolve();
            }
        })
    })
})

app.intent('Get_Incident_Details',function(conv,params,option)
{
    var incidentNumber = '';
    var userID = '';
    var noOfTickets = 10;
    var textToSpeech = '';
    var incidentNumber = '';
    var incidentStatus = '';
    var incidentSymptom = '';
    var incidentCreatedDateTime = ''; 
    var isActionRequired = 1;

    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }

    console.log("Option===>",option);
    if (option)
    {
        incidentNumber = option;
    }
    else
    {
        var resolvedQuery = conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
        if (resolvedQuery == 'No Action Required')
        {
            incidentNumber = '';
            isActionRequired = 0;
        }
    }

    if (incidentNumber != '' && isActionRequired == 1)
    {
        return new Promise(function (resolve, reject)
        {
            GetIncidentDetails(userID, noOfTickets, function (IncidentDetailsArr)
            {
                console.log("Incident Details Array==>", IncidentDetailsArr);
                if (IncidentDetailsArr.length > 0)
                {

                    for (var i = 0; i < IncidentDetailsArr.length; i++)
                    {
                        if (IncidentDetailsArr[i].Incident_ID == incidentNumber)
                        {
                            incidentNumber = IncidentDetailsArr[i].Incident_ID;
                            incidentStatus = IncidentDetailsArr[i].Status;
                            incidentSymptom = IncidentDetailsArr[i].Symptom;
                            incidentCreatedDateTime = IncidentDetailsArr[i].Logged_Time;
                            conv.data.IncidentNumber = IncidentDetailsArr[i].Incident_ID;
                            conv.data.IncidentStatus = IncidentDetailsArr[i].Status;
                        }
                    }
                    if (incidentStatus.toLowerCase() == "new" || incidentStatus.toLowerCase() == "assigned" || incidentStatus.toLowerCase() == "in-progress" || incidentStatus.toLowerCase() == "pending")
                    {
                        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            textToSpeech = 'There is 1 ' + incidentStatus + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident.';
                            conv.contexts.set('update_open_incident', 1);
                            conv.ask(textToSpeech);
                            // Create a basic card
                            conv.ask(new BasicCard({
                                text: 'Symptom: ' + incidentSymptom,
                                // a line break to be rendered in the card.
                                subtitle: 'Status: ' + incidentStatus + ',' + ' Logged Time: ' + incidentCreatedDateTime,
                                title: 'Ticket ID: ' + incidentNumber,
                            }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'Cancel the Incident', 'No Action Required']));
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }
                        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            conv.contexts.set('update_open_incident', 1);
                            textToSpeech = 'There is 1 ' + incidentStatus + ' incident for, ' + incidentSymptom + '. ' + 'The ticket number of the incident is ' + incidentNumber + '. ' + 'and the incident was logged at' + incidentCreatedDateTime + '. ' + 'We can carry out many actions related to the incident. Such as Provide Updates, Remind the Analyst, Escalate, Cancel the Incident and No Action Required. Which one do you want? ';
                            conv.ask(textToSpeech);
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }

                    }
                    if (incidentStatus.toLowerCase() == "resolved" || incidentStatus.toLowerCase() == "closed" || incidentStatus.toLowerCase() == "cancelled")
                    {
                        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            textToSpeech = 'There is 1 ' + incidentStatus + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident';
                            conv.ask(textToSpeech);
                            // Create a basic card
                            conv.ask(new BasicCard({
                                text: 'Symptom: ' + incidentSymptom,
                                // a line break to be rendered in the card.
                                subtitle: 'Status: ' + incidentStatus + ',' + ' Logged Time: ' + incidentCreatedDateTime,
                                title: 'Ticket ID: ' + incidentNumber,
                            }), new Suggestions(['Provide feedback', 'Reopen', 'No Action Required']));
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }
                        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            textToSpeech = 'There is 1 ' + incidentStatus + ' incident for, ' + incidentSymptom + '. ' + 'The ticket number of the incident is ' + incidentNumber + '. ' + 'and the incident was logged at' + incidentCreatedDateTime + '. ' + 'We can carry out many actions related to the incident. Such as Provide feedback, Reopen, No Action Required. Which one do you want? ';
                            conv.ask(textToSpeech);
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }


                    }
                }
            })
        })

    }
    else
    {
        conv.contexts.set('end_conversation', 1);
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you ?',
            text: 'Is there something else do you want me to assist you ?',
        }), new Suggestions(['Yes', 'No'])); 

    }
  
})

app.intent('Know_Status_Of_LastWeekSR',function(conv)
{
    var lastWeek = '';
    var startDate = '';
    var endDate = '';
    var userID = '';
    var noOfTickets = 10;
    var textToSpeech = '';
    var displayText = '';
    conv.data.SRNumber ='';
    conv.data.SRStatus = '';
    var listValuesString = '';
    
    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }
    console.log('UserID====>',userID);
    if(conv.parameters['date-period'] != '')
    {
        lastWeek = conv.parameters['date-period'];
        startDate = new Date(lastWeek.startDate).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        endDate = new Date(lastWeek.endDate).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        //startDate = '2018-07-21 10:56:06';
        //endDate = '2018-07-26 19:41:00';
    }

    if(conv.parameters['date'] != '')
    {
        startDate = new Date(conv.parameters['date']);
        endDate  = new Date(conv.parameters['date']);
        endDate.setHours(startDate.getHours() + 24);
        startDate = new Date(conv.parameters['date']).toISOString().replace(/T/, ' ').replace(/\..+/, '');
        endDate  = new Date(endDate).toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }

    //var newDate1 = date.parse(sample1,'YYYY/MM/DD HH:mm:ss',true);

    console.log('startDate===>',startDate);
    console.log('endDate===>',endDate);

    return new Promise(function(resolve,reject)
    {
        GetSRDetails(userID,noOfTickets,function(SRDetailsArr)
        {
            var slicedSRDetailsArr = [];           
            if(SRDetailsArr.length > 0)
            {
                    for (var i = 0; i < SRDetailsArr.length; i++)
                    {
                        if(SRDetailsArr[i].Reg_Time > startDate && SRDetailsArr[i].Reg_Time < endDate)
                        {
                            console.log("Inside IF====>");
                            console.log("Logged Time===>",SRDetailsArr[i].Reg_Time);
                            slicedSRDetailsArr.push(SRDetailsArr[i]);
                        }                    
                    }  
            }

            console.log("Sliced Array===>",slicedSRDetailsArr);
            console.log("SR Details Array===>",SRDetailsArr);

            if(slicedSRDetailsArr.length > 1)
            {            
                var Items = {};
                for (var i = 0; i < slicedSRDetailsArr.length; i++)
                {
                    Items[slicedSRDetailsArr[i].Ticket_No] = {};
                    Items[slicedSRDetailsArr[i].Ticket_No].title = 'Ticket ID: '+ slicedSRDetailsArr[i].Ticket_No;
                    Items[slicedSRDetailsArr[i].Ticket_No].description = 'Status: ' + slicedSRDetailsArr[i].Status + ',' + ' Logged Time: ' + slicedSRDetailsArr[i].Reg_Time + ',' + ' Symptom: ' + slicedSRDetailsArr[i].Description; 
                    listValuesString += slicedSRDetailsArr[i].Ticket_No + ', ';
                }

                if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    textToSpeech = 'There are ' + slicedSRDetailsArr.length + ' SRs. Below are the details. Select the SR if you wish to carry out any specific actions. If the desired SR is not listed below, request you to provide specific details so that I can help you with the right details';
                    conv.contexts.set('get_SR_details', 1);
                    conv.ask(new SimpleResponse({
                        speech: textToSpeech,
                        text: displayText,
                    }));
                    //Create a list
                    conv.ask(new List({
                        title: 'List of SRs',
                        items: Items,
                    }), new Suggestions('No Action Required'));
                    resolve();
                }
                if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    textToSpeech = 'There are ' + slicedSRDetailsArr.length + ' Service Requests. And the ticket number of the Service Requests are ' + listValuesString + '. Which one would you like to know more about?';
                    conv.contexts.set('get_SR_details', 1);
                    conv.ask(textToSpeech);
                    resolve();
                }

            }
            else if (slicedSRDetailsArr.length == 1)
            {
                conv.data.SRNumber = slicedSRDetailsArr[0].Ticket_ID;
                conv.data.SRStatus = slicedSRDetailsArr[0].Status;
                if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    textToSpeech = 'There is 1 ' + slicedSRDetailsArr[0].Status + ' incident. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the incident.';
                    conv.contexts.set('update_open_SR', 1);
                    conv.ask(textToSpeech);
                    // Create a basic card
                    conv.ask(new BasicCard({
                        text: 'Symptom: ' + slicedSRDetailsArr[0].Description,
                        // a line break to be rendered in the card.
                        subtitle: 'Status: ' + slicedSRDetailsArr[0].Status + ',' + ' Logged Time: ' + slicedSRDetailsArr[0].Reg_Time,
                        title: 'Ticket ID: ' + slicedSRDetailsArr[0].Ticket_No,
                    }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'No Action Required']));
                    resolve();
                }
                if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                {
                    conv.contexts.set('update_open_SR', 1);
                    textToSpeech = 'There is 1 ' + slicedSRDetailsArr[0].Status + ' Service Request for, ' + slicedSRDetailsArr[0].Description + '. ' + 'The ticket number of the Service Request is ' + slicedSRDetailsArr[0].Ticket_No + '. ' + 'and the Service Request was logged at' + slicedSRDetailsArr[0].Reg_Time + '. ' + 'We can carry out many actions related to the Service Request. Such as Provide Updates, Remind the Analyst, Escalate, No Action Required. Which one do you want? ';
                    conv.ask(textToSpeech);
                    console.log("textToSpeech", textToSpeech);
                    resolve();
                }
            }
            else
            {
                conv.contexts.set('identify_SR',1);
                conv.contexts.set('identify_incident',1);
                conv.contexts.set('identify_status',1);
                conv.contexts.set('Last_Incident_Status',1);
                conv.contexts.set('Last_SR_Status',1);
                conv.contexts.set('Last_week_incident',1);
                conv.contexts.set('Last_week_SR',1); 
                conv.ask('There are no SRs matching this criteria. It would be great if you could question me in a more concise manner.'); 
                resolve();
            }
        })
    })

})

app.intent('Get_SR_Details',function(conv,params,option)
{
    var srNumber = '';
    var userID = '';
    var noOfTickets = 10;
    var textToSpeech = '';
    var srNumber = '';
    var srStatus = '';
    var srCreateDateTime = '';
    var srDescription = '';
    var isActionRequired = 1;

    if (conv.data.userID != '' && conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = conv.data.userID;
    }
    if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
    {
        userID = 22025;
    }
    console.log("Option===>",option);
    if (option)
    {
        srNumber = option;
    }
    else
    {
        var resolvedQuery = conv.body.queryResult && conv.body.queryResult.queryText ? conv.body.queryResult.queryText : "";
        if (resolvedQuery == 'No Action Required')
        {
            srNumber = '';
            isActionRequired = 0;
        }
    }
    if (srNumber != '' && isActionRequired == 1)
    {
        return new Promise(function (resolve, reject)
        {
            GetSRDetails(userID, noOfTickets, function (SRDetailsArr)
            {
                console.log("SR Details Array==>", SRDetailsArr);
                if (SRDetailsArr.length > 0)
                {

                    for (var i = 0; i < SRDetailsArr.length; i++)
                    {
                        if (SRDetailsArr[i].Ticket_No == srNumber)
                        {
                            srNumber = SRDetailsArr[i].Ticket_No;
                            srStatus = SRDetailsArr[i].Status;
                            srDescription = SRDetailsArr[i].Description;
                            srCreateDateTime = SRDetailsArr[i].Reg_Time;
                            conv.data.SRNumber = SRDetailsArr[i].Ticket_ID;
                            conv.data.SRtatus = SRDetailsArr[i].Status;
                        }
                    }
                    if (srStatus.toLowerCase() == "new" || srStatus.toLowerCase() == "assigned" || srStatus.toLowerCase() == "in-progress" || srStatus.toLowerCase() == "pending")
                    {
                        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            textToSpeech = 'There is 1 ' + srStatus + ' Service Request. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the Service Request';
                            conv.contexts.set('update_open_SR', 1);
                            conv.ask(textToSpeech);
                            // Create a basic card
                            conv.ask(new BasicCard({
                                text: 'Description: ' + srDescription,
                                // a line break to be rendered in the card.
                                subtitle: 'Status: ' + srStatus + ',' + ' Logged Time: ' + srCreateDateTime,
                                title: 'Ticket ID: ' + srNumber,
                            }), new Suggestions(['Provide Updates', 'Remind the Analyst', 'Escalate', 'No Action Required']));
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }
                        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            conv.contexts.set('update_open_SR', 1);
                            textToSpeech = 'There is 1 ' + srStatus + ' Service Request for, ' + srDescription + '. ' + 'The ticket number of the Service Request is ' + srNumber + '. ' + 'and the Service Request was logged at' + srCreateDateTime + '. ' + 'We can carry out many actions related to the Service Request. Such as Provide Updates, Remind the Analyst, Escalate and No Action Required. Which one do you want? ';
                            conv.ask(textToSpeech);
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }

                    }
                    if (srStatus.toLowerCase() == "resolved" || srStatus.toLowerCase() == "closed")
                    {
                        if (conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            textToSpeech = 'There is 1 ' + srStatus + ' Service Request. Below are the details. Select any one of the following actions, if you would want to carry out any action specific to the Service Request';
                            conv.ask(textToSpeech);
                            // Create a basic card
                            conv.ask(new BasicCard({
                                text: 'Description: ' + srDescription,
                                // a line break to be rendered in the card.
                                subtitle: 'Status: ' + srStatus + ',' + ' Logged Time: ' + srCreateDateTime,
                                title: 'Ticket ID: ' + srNumber,
                            }), new Suggestions(['Provide feedback', 'Reopen', 'No Action Required']));
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }
                        if (!conv.surface.capabilities.has('actions.capability.SCREEN_OUTPUT'))
                        {
                            textToSpeech = 'There is 1 ' + srStatus + ' Service Request for, ' + srDescription + '. ' + 'The ticket number of the Service Request is ' + srNumber + '. ' + 'and the Service Request was logged at' + srCreateDateTime + '. ' + 'We can carry out many actions related to the Service Request. Such as Provide feedback, Reopen and No Action Required. Which one do you want? ';
                            conv.ask(textToSpeech);
                            console.log("textToSpeech", textToSpeech);
                            resolve();
                        }

                    }
                }
            })
        })
    }
    else
    {
        conv.contexts.set('end_conversation', 1);
        conv.ask(new SimpleResponse({
            speech: 'Is there something else do you want me to assist you ?',
            text: 'Is there something else do you want me to assist you ?',
        }), new Suggestions(['Yes', 'No'])); 
    }   
})


//Web Service to Fetch KB Articles
function GetKBArticles(incidentFor, callback) {
    //console.log("Inside GetKBArticles");
    var http = require("https");

    var IMSimilarSuggestionJSON = {
        ServiceName: 'IM_SuggestSimilarSymptoms',
        objCommonParameters:
         {
             _ProxyDetails:
              {
                  UserName: 'admin@symphonysummit.com',
                  OrgID: '1',
                  ReturnType: 'JSON',
                  Password: '9aFKAT@5',
                  AuthType: 'FORM',
                  ProxyID: 0,
                  TokenID: ''
              },
             Instance: 'IT',
             OrgID: '1',
             SearchText: '',
             RequestType: 'Mobile'
         }
    };

    IMSimilarSuggestionJSON.objCommonParameters.SearchText = incidentFor;

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json",
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var KBDetailsJSON = JSON.parse(body);
            var KBDataArray = [];
            KBDataArray = KBDetailsJSON.OutputObject.SymptomSuggestions.KBData;
            //console.log("KBDataArray========", KBDataArray);
            return callback(KBDataArray);
        });
    });

    req.write(JSON.stringify(IMSimilarSuggestionJSON));
    req.end();
}

//Web Service call for Logging an Incident 
function logIncident(userID,symptom, description, callback) {
    console.log('Entered logIncident');
    var http = require("https");
    var IMRequestJson = {
        ServiceName: 'IM_LogOrUpdateIncident',
        objCommonParameters:
         {
             _ProxyDetails:
              {
                  TokenID: '',
                  OrgID: '1',
                  ReturnType: 'JSON',
                  Password: '9aFKAT@5',
                  UserName: 'admin@symphonysummit.com',
                  ProxyID: 0
              },
             incidentParamsJSON:
                 {
                     IncidentContainerJson: ''
                 },
             RequestType: ''
         }

    };
    var incidentContainer = {
        "SelectedAssets": "",
        "Updater": "Caller",
        "Ticket": {
            "IsFromWebService": "True",
            "Criticality": "11",
            "Response_SLA_Met": true,
            "Resolution_Deadline": "0001-01-01T00:00:00",
            "Classification": "47",
            "Desc": "",
            "InternalLog": "",
            "SLA": "",
            "Response_Deadline": "0001-01-01T00:00:00",
            "Sup_Function": "IT",
            "Solution": "",
            "Caller": "22025",
            "LoggedBy": "22025",
            "UserID": "22025",
            "ResolutionCode": 0,
            "Status": "New",
            "ScheduledDate": null,
            "TicketClosingMode": "",
            "Severity": "1",
            "Resolution_SLA_Met": true,
            "Assigned_Workgroup": "65",
            "PendingReason": "",
            "Medium": "Web",
            "Resolution_SLA_Reason": "",
            "Impact_Id": "4",
            "UserLog": "",
            "EncriptTicketID": "",
            "Closure_Code": 0,
            "Reg_Time": "0001-01-01T00:00:00",
            "Category": "68",
            "NotificationMethod": 0,
            "Response_SLA_Reason": "",
            "OpenCategory": "",
            "Assigned_Engineer": 0,
            "Pending_Code": 0,
            "Closure_Code_Name": "",
            "Description": "laptop is not working due to low memory"
        },
        "TicketInformation": {
            "ClosureRemarks": "",
            "Solution": "",
            "InternalLog": "",
            "UserLog": "",
            "Information": "Laptop not working"
        },
        "CustomFields": [
        ]
    };

    incidentContainer.Ticket.Caller = userID;
    incidentContainer.Ticket.LoggedBy = userID;
    incidentContainer.Ticket.UserID = userID;
    incidentContainer.Ticket.Description = description;
    incidentContainer.TicketInformation.Information = symptom;
    IMRequestJson.objCommonParameters.incidentParamsJSON.IncidentContainerJson = JSON.stringify(incidentContainer);


    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var json = JSON.parse(body);
            //var ticketno = json.TicketNo;
            return callback(json);
        });
    });

    req.write(JSON.stringify(IMRequestJson));
    req.end();
}

//Web Service call for getting the Custom Attributes of the given Catalog
function GetSelectedCatalogDetailsListCall(catalogID, callback) {

    console.log("catalogID===========>", catalogID);
    var http = require("https");
    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var srquestiondetails = body;

            var srquesjsondetails = JSON.parse(srquestiondetails);

            var CustomAttributesArr = [];
            var QuestionList = [];
            if (srquesjsondetails.OutputObject === null) {
                return callback(QuestionList);
            }
            //check if the questions are obtained
            if (srquesjsondetails.OutputObject.CatalogDetails.length === 0) {
                return callback(QuestionList);
            }
            CustomAttributesArr = srquesjsondetails.OutputObject.CatalogDetails.CustomAttributes;
            // console.log("CustomAttributesArr===========>", CustomAttributesArr);
            //console.log("CustomAttributesArr.length ==========>", CustomAttributesArr.length)

            for (var i = 0; i < CustomAttributesArr.length; i++)
            {
                //console.log("CustomAttributesArr" + i + "============>", CustomAttributesArr[i])
                if (CustomAttributesArr[i].SR_AttributeValue_UpdatedBy == 'EndUser')
                {

                    var dropdownlists = [];

                    var attrName = CustomAttributesArr[i].SR_CtAttribute_Name;
                    var attrType = CustomAttributesArr[i].DisplayName;
                    var attrValue = CustomAttributesArr[i].SR_AttributeValue;
                    var attrID = CustomAttributesArr[i].SR_CtAttribute_ID;

                    if (CustomAttributesArr[i].DisplayName == 'DropdownList')
                    {

                        var path = srquesjsondetails.OutputObject.CatalogDetails.ListValues;
                        for (var j = 0; j < path.length; j++)
                        {
                            if (attrID == path[j].AttributeID)
                            {
                                var listval = path[j].ListValue;
                                var listid = path[j].AttributeListID;
                                dropdownlists.push({ ListValue: listval, AttributeListID: listid });

                            }
                        }
                    }
                    if (CustomAttributesArr[i].DisplayName !== 'FileUpload')
                    {
                        //console.log("Not file upload so push rest===========>");
                        QuestionList.push({ attrName: attrName.toUpperCase(), attrValue: attrValue, attrId: attrID, attrType: attrType, dropdownlist: dropdownlists });
                    }
                }
            }
            //console.log("QuestionList ================>", QuestionList);
            return callback(QuestionList);
        });
    });

    var quesjson = {
        ServiceName: 'SR_GetSelectedCatalogDetailsList',
        objCommonParameters:
        {
            _ProxyDetails:
            {
                UserName: 'admin@symphonysummit.com',
                OrgID: '1',
                ReturnType: 'JSON',
                Password: '9aFKAT@5',
                TokenID: '',
                AuthType: 'FORM',
                ProxyID: 0
            },
            SR_RequiredParameters:
            {
                LogSRForUserMode: false,
                LogSRForUserID: 0,
                DelegationMode: false,
                InstanceCode: 'IT',
                DelegateeUserID: 0
            },
            ServiceRequestPropertyContract:
            {
                Instance: 'IT',
                CategoryID: 0,
                CatalogID: 0,
                OrgID: '1',
                SelectedLocation: 0
            }
        }
    };
    quesjson.objCommonParameters.ServiceRequestPropertyContract.CatalogID = catalogID;
    //console.log("quesjson ============>", quesjson);
    req.write(JSON.stringify(quesjson));
    req.end();
}

//============Log servicerequest================
function LogServiceRequestCall(userID,userName,categoryName, categoryID, catalogName, catalogID, subjsonArr, callback) {

    var http = require("https");

    var logservicerequest = {
        ServiceName: 'SR_LogServiceCatalog_Workflow',
        objCommonParameters:
        {
            _ProxyDetails:
            {
                UserName: 'admin@symphonysummit.com',
                OrgID: '1',
                ReturnType: 'JSON',
                Password: '9aFKAT@5',
                TokenID: '',
                AuthType: 'FORM',
                ProxyID: 0
            },
            objSRServiceTicket:
            {
                Org_ID: '1',
                ServiceCategoryID: 0,
                WorkGroupID: 1,
                NoOfApprovals: 0,
                WorkflowID: '0',
                HasCompleteApprovalFlow: '1',
                ServiceCategoryName: '',
                ListSRApprovals: [],
                SupportFunction: 'IT',
                strCustomAttributes: '',
                ServiceCatalogName: '',
                JustificationRemarks: 'Kindly process the request',
                LogSRForUserMode: false,
                DelegationMode: true,
                strMVCustomAttributes: '[]',
                DelegateeUserID: 22025,
                FirstLevelNotificationIDs: '',
                ServiceCatalogID: 0,
               	ServiceTicketLoggedBy: 22025,
                ServiceTicketUpdatedBy: 22025,
                RequesterName: '',
            },
            lstUserAttribue: []
        }
    }


    logservicerequest.objCommonParameters.objSRServiceTicket.ServiceCategoryName = categoryName;
    logservicerequest.objCommonParameters.objSRServiceTicket.ServiceCategoryID = categoryID;

    logservicerequest.objCommonParameters.objSRServiceTicket.ServiceCatalogName = catalogName;
    logservicerequest.objCommonParameters.objSRServiceTicket.ServiceCatalogID = catalogID;
    logservicerequest.objCommonParameters.objSRServiceTicket.DelegateeUserID = userID;
    logservicerequest.objCommonParameters.objSRServiceTicket.ServiceTicketLoggedBy = userID;
    logservicerequest.objCommonParameters.objSRServiceTicket.ServiceTicketUpdatedBy = userID;
    logservicerequest.objCommonParameters.objSRServiceTicket.RequesterName = userName;

    logservicerequest.objCommonParameters.objSRServiceTicket.strCustomAttributes = JSON.stringify(subjsonArr);


    //console.log("logservicerequest=========>", logservicerequest);

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache"
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var srdata = body;
            var srjson = JSON.parse(srdata);
            var srticketnum = '';

            if (srjson.OutputObject !== null) {
                srticketnum = "S R "
                srticketnum += srjson.OutputObject.CatalogDetails.SRId;
            }
            //console.log("srticketnum=================>", srticketnum);

            return callback(srticketnum);
        });
    });

    req.write(JSON.stringify(logservicerequest));
    req.end();
};

//============convert number into digit ================
function numberToDigit(num, callback) {
    var a = ""
    a += num
    var b = a.match(/\d{1}/g);
    var str = ""
    // _.each(b, (ele) => {
    for (var i = 0; i < b.length; i++) {
        str += " " + b[i];
        // console.log("str=====>", str);
    }

    return callback(str);
};

//===========Get catalog details through Azure Search API===============
function GetServiceCatalogDetails(searchString,callback)
{
    console.log("inside fetching catalog===>");
    console.log("SearchString",searchString);

    var http = require("https");
    //var path = encodeURI('/indexes/sr-categorynew-index/docs?api-version=2017-11-11&search='+searchString);
    var path = encodeURI('/indexes/sr-categorynewonlyitwithai8-index/docs?api-version=2017-11-11&search=' + searchString);
    var catalogDetailsArr = [];

    console.log("path=====>",path);

    var options = {
        "method": "GET",
        "hostname": "summitazuresearch.search.windows.net",
        "port": null,
        "path": path,      
        "headers": {
            "content-type": "application/json",
            "api-key": "72095D15AF5672AEF2E9941F4F1D040B",
            "cache-control": "no-cache"
        }
    };
    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            var srjsondetails = JSON.parse(body);
            catalogDetailsArr = srjsondetails.value;
            //var topSRDetail = catalogDetailsArr.splice(0, 1);
            //var topSRDetail = catalogDetailsArr[0];
            //console.log("SRDETAILSARR===>", catalogDetailsArr);
            return callback(catalogDetailsArr);
        });
    });

    req.end();
}

//================Get incidents Logged by a User===========
function GetIncidentDetails(userID,noOfTickets,callback)
{
    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json"
        }
    };

    var requestJSON = {
        ServiceName: 'IM_GetMyIncidents',
        objCommonParameters: 
         { _ProxyDetails: 
            { AuthType: 'FORM',
                ProxyID: 0,
                TokenID: '',
                UserName: 'admin@symphonysummit.com',
                OrgID: '1',
                ReturnType: 'JSON',
                Password: '9aFKAT@5'
            },
             InstanceCode: 'IT',
             IncidentParam: 
              {   Workgroup: 0,
                  Instance: 'IT',
                  Executive: 0,
                  PageSize: '10',
                  CurrentPageIndex: 0,
                  Status: 'New',
                  OrgID: '1',
                  Caller: '22025' 
              } 
         }
    };

    requestJSON.objCommonParameters.IncidentParam.Caller = userID;
    requestJSON.objCommonParameters.IncidentParam.PageSize = noOfTickets;

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var outputJSON = JSON.parse(body);
            var imDetailsJSON = outputJSON.OutputObject.MyTickets;
            var imDetailsStr = JSON.stringify(imDetailsJSON);
            imDetailsStr = imDetailsStr.replace(/\"Incident ID\":/g, "\"Incident_ID\":");
            imDetailsStr = imDetailsStr.replace(/\"Logged Time\":/g, "\"Logged_Time\":");
            var finalJSON = JSON.parse(imDetailsStr);
             //console.log("Final JSON=====>",finalJSON);
            return callback(finalJSON);
        });
    });

    req.write(JSON.stringify(requestJSON));
    req.end();

}

//================Get SRs Logged by a User===========
function GetSRDetails(userID,noOfTickets,callback)
{
    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json"
        }
    };

    var requestJSON = { 
        ServiceName: 'SR_GetCallerServiceRequest',
        objCommonParameters: 
         { _ProxyDetails: 
            { Password: '9aFKAT@5',
                UserName: 'admin@symphonysummit.com',
                ProxyID: 0,
                ReturnType: 'JSON',
                OrgID: 1 },
             CallerMobileNo: '',
             CallerID: '22025',
             TopServiceRequest: '10' 
         } 
    };

    requestJSON.objCommonParameters.CallerID = userID;
    requestJSON.objCommonParameters.TopServiceRequest = noOfTickets;

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var outputJSON = JSON.parse(body);          
            var srDetailsJSON  = outputJSON.OutputObject.SRDetails;
            var srDetailsStr = JSON.stringify(srDetailsJSON);
            srDetailsStr = srDetailsStr.replace(/\"MySRDetails \":/g, "\"MySRDetails\":");
            var finalJSON = JSON.parse(srDetailsStr);
            finalJSON = finalJSON.MySRDetails;
            console.log("SR Details JSON====>",finalJSON);
            return callback(finalJSON);
        });
    });

    req.write(JSON.stringify(requestJSON));
    req.end();
}

//================To find if the given number is incident/SR===========
function GetTicketDetails(userID,noOfTickets,ticketNumber,callback)
{

    var incidentDetailsJSON = {
        IncidentNumber : '',
        IncidentStatus : '',
        IncidentCreatedDate : '',
        IncidentDescription : ''
    };

    var srDetailsJSON = {
        SRNumber : '',
        SRID : '',
        SRStatus : '',
        SRCreatedDate : '',
        SRDescritpion : ''    
    }

    var promise1 = new Promise(function(resolve,reject)
    {
        GetIncidentDetails(userID,noOfTickets,function(imDetailsArr)
        {
            console.log("Incident Details Array Length===>",imDetailsArr.length);
            console.log("Inside Incident Details");
            if(imDetailsArr.length > 0)
            {
                for(var i=0;i < imDetailsArr.length; i++)
                {
                    console.log("Inside Incident For Loop");
                    if(imDetailsArr[i].Incident_ID == ticketNumber)
                    {
                        console.log("Inside Incident Ticket Details===>");
                        incidentDetailsJSON.IncidentNumber = imDetailsArr[i].Incident_ID;
                        incidentDetailsJSON.IncidentStatus = imDetailsArr[i].Status;
                        incidentDetailsJSON.IncidentCreatedDate = imDetailsArr[i].Logged_Time;
                        incidentDetailsJSON.IncidentDescription = imDetailsArr[i].Symptom;                         
                    }   
                }        
            }
            resolve(incidentDetailsJSON);
        })
    });
        
    var promise2 = new Promise((resolve, reject) => 
        {
            GetSRDetails(userID,noOfTickets,function(srDetailsArr)
            {
                console.log("Inside SR Details");
                if(srDetailsArr.length > 0)
                {
                    for(var i=0;i < srDetailsArr.length; i++)
                    {
                        console.log("Inside SR Details For loop===>");
                        if(srDetailsArr[i].Ticket_ID == ticketNumber)
                        {
                            console.log("Inside SR Ticket Details====>");  
                            srDetailsJSON.SRNumber = srDetailsArr[i].Ticket_No;
                            srDetailsJSON.SRStatus = srDetailsArr[i].Status;
                            srDetailsJSON.SRCreatedDate = srDetailsArr[i].Reg_Time;
                            srDetailsJSON.SRDescritpion = srDetailsArr[i].Description; 
                            srDetailsJSON.SRID = srDetailsArr[i].Ticket_ID; 
                           
                        }
                    }
                }
                resolve(srDetailsJSON);
            })
       
        })

    Promise.all([promise1, promise2]).then(function(ticketDetailsArray) {
        console.log(ticketDetailsArray);
        return callback(ticketDetailsArray);
    });
}

//================To update an Incident===========
function UpdateIncident(ticketNumber,userId,status,comment,callback)
{
    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json"
        }
    };

    var requestJSON = { 
        ServiceName: 'IM_LogOrUpdateIncident',
        objCommonParameters: 
         { 
             incidentParamsJSON: 
                 {
                     IncidentContainerJson: '' 
                 },
             RequestType: '',
             _ProxyDetails: 
              {   OrgID: '1',
                  ReturnType: 'JSON',
                  Password: '9aFKAT@5',
                  UserName: 'admin@symphonysummit.com',
                  AuthType: 'FORM',
                  ProxyID: 0,
                  TokenID: '' 
              } 
         } 
    };

    var incidentContainer = {
        "Updater":"Caller",
        "TicketInformation":
            {
                "Information":"Test1"
            },
        "Ticket":
            {
                "Status":"New",
                "Assigned_Workgroup":"",
                "Assigned_Engineer":null,
                "LoggedBy":"6225967",
                "Org_Id":"1",
                "Medium":"Application",
                "Sup_Function":"IT",
                "IsFromWebService":"true",
                "Ticket_No":"723798",
                "Description":"",
                "Caller":"",
                "EncriptTicketID":""
            }
    };

    incidentContainer.Ticket.Status = status;
    incidentContainer.Ticket.LoggedBy = userId;
    incidentContainer.Ticket.Caller = userId;
    incidentContainer.Ticket.Ticket_No = ticketNumber;
    incidentContainer.TicketInformation.Information = comment;
    requestJSON.objCommonParameters.incidentParamsJSON.IncidentContainerJson = JSON.stringify(incidentContainer);


    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var outputJSON = JSON.parse(body);
            return callback(outputJSON);
        });
    });

    req.write(JSON.stringify(requestJSON));
    req.end();
}

//================To fetch the user details authorized by Google===========
function GetAuthUserDetails(accessToken,callback)
{
    var http = require("https");

    var options = {
        "method": "GET",
        "hostname": "summitcinde.auth0.com",
        "port": null,
        "path": "/userinfo/",
        "headers": {
            "authorization": "Bearer "+accessToken,
        }
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var outputJSON = JSON.parse(body); 
            return callback(outputJSON);
        });
    });

    req.end();

}

//================To check whether a google authorized user has account in Summit===========
function GetSummitUserDetails(emailId,chatBotID,callback)
{

    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json"
        }
    };

    var requestJSON = 
        { 
            ServiceName: 'ChatBot_Authentication',
            objCommonParameters: 
                                {
                                    _ProxyDetails: 
                                                  {
                                                    TokenID: '',
                                                    OrgID: '1',
                                                    ReturnType: 'JSON',
                                                    Password: '9aFKAT@5',
                                                    UserName: 'admin@symphonysummit.com',
                                                    ProxyID: 0 
                                                  },
                                    EmailID: 'csushma47@gmail.com',
                                    ChatBotID: 'abc'
         } 
        };

    requestJSON.objCommonParameters.EmailID = emailId;
    requestJSON.objCommonParameters.ChatBotID = chatBotID;



    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            //console.log(body.toString());
            var outputJSON = JSON.parse(body); 

            var userDetailsJSON = outputJSON.OutputObject.UserData[0];
            return callback(userDetailsJSON);
        });
    });

    req.write(JSON.stringify(requestJSON));
    req.end();

}

//================To cancel an Incident===========
function CancelIncident(ticketNumber,userId,comment,callback)
{
    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json"
        }
    };

    var requestJSON = { 
        ServiceName: 'IM_LogOrUpdateIncident',
        objCommonParameters: 
         { _ProxyDetails: 
            { TokenID: '',
                OrgID: '1',
                ReturnType: 'JSON',
                Password: '9aFKAT@5',
                UserName: 'admin@symphonysummit.com',
                ProxyID: 0 },
         incidentParamsJSON: 
             { IncidentContainerJson: '' } 
         } };

    var incidentContainer = {
        "TicketInformation":{
            "CancelRemarks":"Cancelled the ticket.",
            "Information":""
        },
        "Ticket":
            {
                "Medium":"Web",
                "Ticket_No":"723799",
                "Org_Id":"1",
                "Sup_Function":"IT",
                "IsFromWebService":"true",
                "Caller":"6225967",
                "LoggedBy":"6225967",
                "Status":"Cancelled"
            },
        "Updater":"Caller"
    };

    incidentContainer.Ticket.LoggedBy = userId;
    incidentContainer.Ticket.Caller = userId;
    incidentContainer.Ticket.Ticket_No = ticketNumber;
    incidentContainer.TicketInformation.Information = comment;
    requestJSON.objCommonParameters.incidentParamsJSON.IncidentContainerJson = JSON.stringify(incidentContainer);


    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var outputJSON = JSON.parse(body);
            return callback(outputJSON);
        });
    });

    req.write(JSON.stringify(requestJSON));
    req.end();

}

//================To update a SR=======================
function UpdateServiceRequest(ticketNumber,userId,comment,callback)
{
    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json",
            "cache-control": "no-cache",
            "postman-token": "37a5e440-4822-5b93-39b5-63eee77492c9"
        }
    };

    var requestJSON = { 
        ServiceName: 'SR_UpdateMyRequestDetails_Workflow',
        objCommonParameters: 
                         { 
                             objSRServiceTicket:  {       
                                                    Status: 'Approved',
                                                    TicketID: '',
                                                    AdditionalInfo: '',
                                                    AssignedEngineer: null,
                                                    SupportFunction: 'IT',
                                                    ServiceTicketID: '',
                                                    DelegationMode: true,
                                                    LocationId: 0,
                                                    Org_ID: '1',
                                                    DelegateeUserID: '' 
                                                   },
                             _ProxyDetails: { 
                                                    OrgID: '1',
                                                    ReturnType: 'JSON',
                                                    Password: '9aFKAT@5',
                                                    UserName: 'admin@symphonysummit.com',
                                                    AuthType: 'FORM',
                                                    ProxyID: 0,
                                                    TokenID: '' 
                                            } 
                             } };

    requestJSON.objCommonParameters.objSRServiceTicket.TicketID = ticketNumber;
    requestJSON.objCommonParameters.objSRServiceTicket.AdditionalInfo = comment;
    requestJSON.objCommonParameters.objSRServiceTicket.ServiceTicketID = ticketNumber;
    requestJSON.objCommonParameters.objSRServiceTicket.DelegateeUserID = userId;

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var outputJSON = JSON.parse(body);
            return callback(outputJSON);
        });
    });

    req.write(JSON.stringify(requestJSON));
    req.end();

}

//================To get the Catalog Details using Category ID=======================
function GetSRCatalogDetails(userID, categoryID, isLeafNode, callback)
{
    var http = require("https");

    var options = {
        "method": "POST",
        "hostname": "customerdemo.symphonysummit.com",
        "port": null,
        "path": "/SummitAI/DC/REST/Summit_RESTWCF.svc/RESTService/CommonWS_JsonObjCall",
        "headers": {
            "content-type": "application/json"
        }
    };

    var requestJSON = {
        ServiceName: 'SR_ServiceCatalogDetails',
        objCommonParameters:
            {
                ServiceRequestProperty:
                    {
                        OrgID: '1',
                        CategoryID: '',
                        Instance: 'IT',
                        UserID: '',
                        CategoryOrCatalog: '',
                        SearchKeyword: '',
                        CatalogTypeID: 0,
                        EntitledService: false
                    },
                _ProxyDetails:
                    {
                        OrgID: '1',
                        ReturnType: 'JSON',
                        Password: '9aFKAT@5',
                        UserName: 'admin@symphonysummit.com',
                        AuthType: 'FORM',
                        ProxyID: 0,
                        TokenID: ''
                    }
            }
    };

    requestJSON.objCommonParameters.ServiceRequestProperty.CategoryID = categoryID;
    requestJSON.objCommonParameters.ServiceRequestProperty.UserID = userID;
    requestJSON.objCommonParameters.ServiceRequestProperty.CategoryOrCatalog = isLeafNode == 1 ? "CATALOG" : "CATEGORY";


    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log(body.toString());
            var outputJSON = JSON.parse(body);
            var catalogDetailsArr = outputJSON.OutputObject.Details.CatalogDetail;
            return callback(catalogDetailsArr);
        });
    });

    req.write(JSON.stringify(requestJSON));
    req.end();
}




