var db;
var userRef;
var productRef;
var locationRef;
var inventoryRef;

function signedInHandler()
{
    console.log("Signed In As: " + currentUser.displayName);
    db = firebase.database();
    userRef = db.ref(currentUser.uid + "/");
    productRef = db.ref(currentUser.uid + "/Products/");
    locationRef = db.ref(currentUser.uid + "/Locations/");
    inventoryRef = db.ref(currentUser.uid + "/Inventory/");

    document.getElementById("firebaseui-auth-container").style.display = "none";

    displayLocations();
    displayProducts();
    displayInventory();
}

function displayLocations()
{
    locationRef.on('value', function(snapshot){
        var newHTML = "<h2>Locations</h2>";
        snapshot.forEach(function(location){
            newHTML += "<p>" + location.key + " : " + location.val().products + "</p>";
        });
        document.getElementById("locationList").innerHTML = newHTML;
    });
}

function displayProducts()
{
    productRef.on('value', function(snapshot){
        var newHTML = "<h2>Products</h2>";
        snapshot.forEach(function(product){
            newHTML += "<p>" + product.key + " : " + product.val().locations + "</p>";
        });
        document.getElementById("productList").innerHTML = newHTML;
    });
}

function displayInventory()
{
    inventoryRef.on('value', function(snapshot){
        var newHTML = "<h2>Inventory</h2>";
        snapshot.forEach(function(inventory){
            newHTML += "<p>" + inventory.key + ": " + inventory.val() + "</p>";
        });
        document.getElementById("inventoryList").innerHTML = newHTML;
    });
}

function signedOutHandler()
{
    console.log("Signed Out");
}

function newLocation()
{
    var nameResult = cleanInput(prompt("New Location's Name:"));

    if (nameResult != null)
    {

        locationRef.child(nameResult).once("value", function(location){
            if (location.exists())
            {
                console.log("Already Exists");
            }
            else
            {
                locationRef.child(nameResult).update({
                    products: "",
                });
            }
        });
    }
}

function newProduct()
{
    var nameResult = cleanInput(prompt("New Product's Name:"));

    if (nameResult!=null)
    {
        productRef.child(nameResult).once('value', function(product){
            if(product.exists())
            {
                console.log("Already Exists");
            }
            else
            {
                productRef.child(nameResult).update({
                    locations: "",
                });

                var newObject = {};
                newObject[nameResult] = 0;

                inventoryRef.update(newObject);
            }
        });
    }
}

function cleanInput(string)
{
    if (string != null)
    {
        return string.replace(/[^0-9a-z\ ]/gi, "").trim().toLowerCase();
    }
    else
    {
        return null;
    }
}
