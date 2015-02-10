var StrapKit = require('strapkit');
var customerIds = ["54b604dfa520e02948a0f4ac", "54b604dfa520e02948a0f3ba", "54b604dfa520e02948a0f6b1"];
var API_KEY = "AIzaSyBnxv-KQ437fSAuzwlZdSmPI82947qJrgo";
var geocoder;
var Ajax = require('ajax');
// StrapKit.HttpClient({
//         url: "https://maps.googleapis.com/maps/api/js?key=AIzaSyBVfrAKaDoZw96DsECnOXh5aPj1AJB5WMc",
//         dataType: "script"
//     },
//     function(data) {

//         geocoder = google.maps.Geocoder();
//     },
//     function(error) {
//         console.log(error);
//     }
// );
//var app_id = "aS7DXLiJBx8BYp6y2";

//StrapKit.Metrics.Init(app_id);

// Show splash screen while waiting for data
var splashPage = StrapKit.UI.Page();

// Text element to inform user
var card = StrapKit.UI.TextView({
    position: 'center',
    text: 'Loading data now...'
});

// Add to splashPage and show
splashPage.addView(card);
splashPage.show();


var customerPage = StrapKit.UI.Page();
var customerItems = [];
var accountsItems = [];
var tbItems = [];



function genWrongPinPage(data) {
    var wrongPinPage = StrapKit.UI.Page();
    var card = StrapKit.UI.Card({
        title: "You have entered a wrong PIN number",
        body: "Please press select and enter your PIN again"
    });
    card.setOnClick(function() {
        checkPassword([0, 0, 0, 0], data, 0, true);
    });
    wrongPinPage.addView(card);
    wrongPinPage.show();

}

function checkPassword(password, data, position, totalCorrect) {
    //console.log(position);
    var passwordPage = StrapKit.UI.Page();
    var passCode = [0, 1, 2, 0];
    var digits = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    var correct = totalCorrect;
    var newPos = 0;
    var menuItems = [{
        title: '0'
    }, {
        title: '1'
    }, {
        title: '2'
    }, {
        title: '3'
    }, {
        title: '4'
    }, {
        title: '5'
    }, {
        title: '6'
    }, {
        title: '7'
    }, {
        title: '8'
    }, {
        title: '9'
    }];
    var customerMenu = StrapKit.UI.ListView({
        items: menuItems
    });
    customerMenu.setOnItemClick(function(e) {
        var fields = e.item;
        //console.log(position);
        if (passCode[newPos] != fields.title) {
            correct = false;
            newPos = 0;
            genWrongPinPage(data);
        }
        newPos++;
        if (newPos == 4) {
            if (correct === true) {
                showAccntPage(data);
            } else {
                checkPassword(password, data, 0, true);
            }
        }
        console.log("newPos" + newPos);
        //checkPassword(password, data, position + 1, correct);
    });

    //showAccntPage(data);
    passwordPage.addView(customerMenu);
    passwordPage.show();


    // and GET THE YUHJAHS
}

function confirmTransaction(payerId, payeeId, amount, customerFields)
{
    var confirmTransactionPage = StrapKit.UI.Page();
    var card = StrapKit.UI.Card({
        title: "Please Confirm This Transaction",
        body:"Press select to confirm, or back to cancel"
    });
    card.setOnClick(function(){
        GenTB(payerId, customerFields);
// "http://api.reimaginebanking.com:80/accounts/54b604e0a520e02948a0f827/transactions?key=ENT623a2f188dff46e7483abafa0ff80b1a
// "
    });
    confirmTransactionPage.addView(card);
    confirmTransactionPage.show();

}

function selectTransaction(payerId, payeeId, customerFields)
{
    console.log(payerId + "   " + payeeId);
    var selectTransactionPage = StrapKit.UI.Page();
    var menuItems = [{
        title: '$1000'
    }, {
        title: '$2000'
    }, {
        title: '$3000'
    }, {
        title: '$4000'
    }, {
        title: '$5000'
    }, {
        title: '$6000'
    }, {
        title: '$7000'
    }, {
        title: '$8000'
    }, {
        title: '$9000'
    }, {
        title: '$10000'
    }];
    var transactionMenu= StrapKit.UI.ListView({
        items: menuItems
    });
    transactionMenu.setOnItemClick(function(e){
        confirmTransaction(payerId, payeeId, e.item.title, customerFields);
    });
    selectTransactionPage.addView(transactionMenu);
    selectTransactionPage.show();

}

function createTransaction(id, customerFields) {
    var success = function(data){
    console.log(JSON.stringify(data));
    var createTransactionPage = StrapKit.UI.Page();
    var transactionItems = [];
        for (var a = 0; a < Object.keys(data).length; a++) {
            transactionItems.push({
                title: data[a].nickname,
                subtitle: data[a].type + " $" + data[a].balance + " (" + Object.keys(data[a]['bill ids']).length + ")",
                data: data[a]
            });
        }
        var transactionList = StrapKit.UI.ListView({
            items: transactionItems
        });
        transactionList.setOnItemClick(function(e) {
            selectTransaction(id, e.item.data._id, customerFields);
            // var accntId = e.item.data._id;
            // showAccntDetails(accntId, fields);

        });
        createTransactionPage.addView(transactionList);
        createTransactionPage.show();
    };

    var failure = function(error) {
        console.log(error);
    };


    StrapKit.HttpClient({
            url: "http://api.reimaginebanking.com/customers/" + customerFields._id + "/accounts?key=ENT623a2f188dff46e7483abafa0ff80b1a",
            type: "json"
        },
        success,
        failure
    );


}

function confirmPayment(data, accID, customerFields) {
    console.log(JSON.stringify(customerFields));
    var confirmPaymentPage = StrapKit.UI.Page();
    var card = StrapKit.UI.Card({
        title: "Do you want to pay this bill?",
        body: "Press select to confirm"
    });
    card.setOnClick(function() {
        StrapKit.HttpClient({
                url: "http://api.reimaginebanking.com:80/accounts/" + accID + "/bills/" + data._id + "?key=ENT623a2f188dff46e7483abafa0ff80b1a",
                type: 'json'
            },
            function(data) {
                //if(data['payment amount'] > customerFields['balance'])
                GenTB(accID, customerFields);
            },
            function(error) {
                console.log(error);
            });
    });

    confirmPaymentPage.addView(card);
    confirmPaymentPage.show();
}

function tbDetails(data, accID, customerFields) {
    var tbDetailsPage = StrapKit.UI.Page();
    var card = StrapKit.UI.Card({
        title: "Bill: " + data.status,
        body: "Due: $" + data['payment amount'] + "\nDate Due: " +
            data['payment date'] + "\nRecurring: " + data['recurring']
    });
    card.setOnClick(function() {
        confirmPayment(data, accID, customerFields);
    });
    tbDetailsPage.addView(card);
    tbDetailsPage.show();
}


function GenTB(id, customerFields) {
    var success = function(data) {
        console.log(id);
        console.log(JSON.stringify(data));
        var size = Object.keys(data).length;
        tbItems = [];
        for (var a = 0; a < Object.keys(data).length; a++) {
            tbItems.push({
                title: "Bill: $" + data[a]['payment amount'],
                subtitle: "Status: " + data[a]['status'],
                data: data[a],
                type: "Bill"
            });
        }
        StrapKit.HttpClient({
                url: "http://api.reimaginebanking.com:80/accounts/" + id + "/transactions?key=ENT623a2f188dff46e7483abafa0ff80b1a",
                type: 'json'
            },
            function sucess(data) {
                size = Object.keys(data).length;
                for (var a = 0; a < size; a++) {
                    tbItems.push({
                        title: "Transaction: " + data[a]['payment amount'],
                        subtitle: "Status: " + data[a].status,
                        data: data[a],
                        type: "Transaction"
                    });
                }
            },
            function failure(error) {
                console.log(error);
            });
        tbItems.push({
            title: "Create Transaction",
            type: "cTransaction"
        });
        var tbList = StrapKit.UI.ListView({
            items: tbItems
        });
        tbList.setOnItemClick(function(e) {
            if (e.item.type == "Bill")
                tbDetails(e.item.data, id, customerFields);
            else if (e.item.type == "cTransaction")
                createTransaction(id, customerFields);

        });

        var tbPage = StrapKit.UI.Page();
        tbPage.addView(tbList);
        tbPage.show();

    };
    var failure = function(error) {
        console.log(error);
    };
    StrapKit.HttpClient({
            url: "http://api.reimaginebanking.com:80/accounts/" + id + "/bills?key=ENT623a2f188dff46e7483abafa0ff80b1a",
            type: 'json'
        },
        success,
        failure
    );
}

function showAccntDetails(id, customerFields) {
    var success = function(data) {
        var accountDetailsPage = StrapKit.UI.Page();

        console.log(JSON.stringify(data));
        var card = StrapKit.UI.Card({
            title: data.nickname,
            body: data.type + " \nBalance: $" + data.balance + "\nNum of bills due " + Object.keys(data['bill ids']).length +
                "\nAccount Num: " + data.number + "\nRewards: " + data.rewards
        });
        card.setOnClick(function() {
            GenTB(id, customerFields);
        });
        accountDetailsPage.addView(card);
        accountDetailsPage.show();
    };
    var failure = function(error) {
        console.log(error);
    };
    StrapKit.HttpClient({
            url: "http://api.reimaginebanking.com:80/accounts/" + id + "?key=ENT623a2f188dff46e7483abafa0ff80b1a",
            type: 'json'

        },
        success,
        failure

    );
}

function showAccntPage(fields) {
    var success = function(data) {
        var accountsPage = StrapKit.UI.Page();
        accountsItems = [];
        for (var a = 0; a < Object.keys(data).length; a++) {
            accountsItems.push({
                title: data[a].nickname,
                subtitle: data[a].type + " $" + data[a].balance + " (" + Object.keys(data[a]['bill ids']).length + ")",
                data: data[a]
            });
        }
        var accountsList = StrapKit.UI.ListView({
            items: accountsItems
        });
        accountsList.setOnItemClick(function(e) {
            var accntId = e.item.data._id;
            showAccntDetails(accntId, fields);

        });
        accountsPage.addView(accountsList);
        accountsPage.show();
    };

    var failure = function(error) {
        console.log(error);
    };

    StrapKit.HttpClient({
            url: "http://api.reimaginebanking.com/customers/" + fields._id + "/accounts?key=ENT623a2f188dff46e7483abafa0ff80b1a",
            type: "json"
        },
        success,
        failure
    );
}

function addrtoLatLong(addr)
{
    var success = function(data)
    {
        //console.log(JSON.stringify(data));
        console.log(JSON.stringify(data['results'][0]));
    }
    var failure = function(error)
    {
        console.log(error);
    }
    StrapKit.HttpClient({
        url: "https://maps.googleapis.com/maps/api/geocode/json?address="+addr+"&key="+API_KEY,
        type:'json'
    },
    success,
    failure);

}
//https://maps.googleapis.com/maps/api/geocode/json?address=1025+Washington+Blvd,+Laurel,+MD&key=AIzaSyBnxv-KQ437fSAuzwlZdSmPI82947qJrgo
function latlongToAddr(lat, longt)
{
    console.log("converting lat long to addr");
    console.log("https://maps.googleapis.com/maps/api/geocode/json?latlng="+String(lat)+","+String(longt)+"-73.961452&key=" + API_KEY);
    var success = function(data)
    {
        console.log(JSON.stringify(data));
    }
    var failure = function(error)
    {
        console.log(error);
    }
    StrapKit.HttpClient({
        url: "https://maps.googleapis.com/maps/api/geocode/json?latlng="+String(lat)+","+String(longt)+"&key=" + API_KEY,
        type: 'json'
    },
    success,
    failure
    );

}
//"https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=API_KEY"
function findBranch() {
    console.log("finding Branches");
    var latlongs = [];
    var failure = function(error)
    {
        console.log(error);
    }
    var success = function(data)
    {
        if (navigator && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                console.log("Got geolocation!");
                var latitude = position.coords.latitude;
                var longitude = position.coords.longitude;
                console.log(latitude + " " + longitude);
            }, function() {
                console.log("Failed to get geolocation!");
            }, {
                maximumAge: 50000,
                timeout: 5000,
                enableHighAccuracy: true
            });
        }
        var branchPage = StrapKit.UI.Page();
        var d = new Date();
        var i = d.getDay();
        var card = StrapKit.UI.Card(
            {
                title:data.name,
                body: data.address[0] +  +  "\n" + data.hours + "\n" + data['phone number']
            });
        branchPage.addView(card);
        branchPage.show();
        //console.log("Data: "+JSON.stringify(data));
       /* for(var a = 0; a < Object.keys(data).length; a++)
        {
            var streetName = data[a]['address']['street name'];
            streetName = streetName.replace(/\s+/g, '+');
            var cityName = data[a]['address']['city'];
            cityName = cityName.replace(/\s+/g, '+');
            //console.log("address formatted:" + data[a]['address']['street number'] + "+" + streetName + ",+"+ 
             //   cityName + ",+" + data[a]['address']['state']);
            latlongs.push({
                latlong: addrtoLatLong(data[a]['address']['street number'] + "+" + streetName + ",+"+ 
                cityName + ",+" + data[a]['address']['state']),
                id: data[a]._id
        });
        }*/
    StrapKit.HttpClient({
        url: "http://api.reimaginebanking.com:80/branches/54b604dfa520e02948a0f3ad?key=ENT623a2f188dff46e7483abafa0ff80b1a",
        type:'json'
    },
    success,
    failure);
        //console.log(latlongs);
    };
    var failure = function(error)
    {
        console.log(error);
    }

    StrapKit.HttpClient({
        url: "http://api.reimaginebanking.com:80/branches?key=ENT623a2f188dff46e7483abafa0ff80b1a",
        type: 'json'
    },
    success,
    failure);
    // var failure = function(error)
    // {
    //     console.log(error);
    // };
    // Ajax({
    //     url:  "https://maps.googleapis.com/maps/api/js?key=AIzaSyBVfrAKaDoZw96DsECnOXh5aPj1AJB5WMc",
    //     type: "script",
    // },
    // success);

}

function GenCustyMenu(i) {
    console.log("GenCustyMenu called");
    i = i || 0;

    var success,
        failure = function(err) {};
    var url = "http://api.reimaginebanking.com:80/customers/" + customerIds[i] + "?key=ENT623a2f188dff46e7483abafa0ff80b1a";

    success = function(data) {
        // console.log("successful return");

        customerItems.push({
            title: data['first name'] + " " + data['last name'],
            data: data,
            type: "customer"
        });

        console.log("i" + i);

        // create aggregate menu on last successful ajax return
        if (i == customerIds.length - 1) {
            // console.log("aggregate");
            customerItems.push({
                title: "Find nearest branch",
                type: "fBranch"
            });
            customerItems.push({
                title: "Find nearest ATM",
                type: "fATM"
            });
            var customerMenu = StrapKit.UI.ListView({
                items: customerItems
            });
            customerMenu.setOnItemClick(function(e) {
                if (e.item.type == "customer") {
                    var fields = e.item.data;
                    checkPassword([0, 0, 0, 0], fields, 0, true);
                    //showAccntPage(fields);
                } else if (e.item.type == "fBranch") {
                    findBranch();
                }
            });
            customerPage.addView(customerMenu);
            customerPage.show();
        }

        if (i < customerIds.length) {
            // console.log("set next url");
            i = i + 1;
            GenCustyMenu(i);
        }

    };
    StrapKit.HttpClient({
            url: url,
            type: "json"
        },
        success,
        failure
    );
}

GenCustyMenu();