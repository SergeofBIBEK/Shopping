var db;
var userRef;
var productRef;
var locationRef;
var inventoryRef;
var shoppingRef;

function signedInHandler()
{
    console.log("Signed In As: " + currentUser.displayName);
    db = firebase.database();
    userRef = db.ref(currentUser.uid + "/");
    productRef = db.ref(currentUser.uid + "/Products/");
    locationRef = db.ref(currentUser.uid + "/Locations/");
    inventoryRef = db.ref(currentUser.uid + "/Inventory/");
    shoppingRef = db.ref(currentUser.uid + "/ShoppingList");

    document.getElementById("firebaseui-auth-container").style.display = "none";

    displayLocations();
    displayProducts();
    displayInventory();
    displayShoppingList();

    setUpUserBox();
}

function displayShoppingList()
{
    shoppingRef.on('value', function(snapshot){
        var newHTML = "<h2>Shopping List</h2>";
        snapshot.forEach(function(item){
            newHTML += "<p>" + item.key + ": " + item.val() + "</p>";
        });
        document.getElementById("shoppingListContainer").innerHTML = newHTML;
    });
}

function setUpUserBox()
{
    var htmlString = "<img class='userPhoto' src='" + currentUser.photoURL + "'>" +
        "<p>" + currentUser.displayName + "</p>";

    document.getElementById("UserBox").innerHTML = htmlString;
}

function displayLocations()
{
    locationRef.on('value', function(snapshot){
        var newHTML = "<h2>Locations</h2>";
        snapshot.forEach(function(location){
            newHTML += "<div class='listItem'>";
            newHTML += "<input onclick='removeLocation(\"" + location.key + "\")' class='deleteButton' value='x' type='button'>";
            newHTML += "<p>" + location.key + " : " + getProductsByLocation(location.key) + "</p>";
            newHTML += "</div>";
        });
        document.getElementById("locationList").innerHTML = newHTML;
    });
}

function getProductsByLocation(loc)
{
    var HTMLString = " ";
    locationRef.child(loc).once("value", function(products){
        products.forEach(function(product){
            if (product.val())
            {
                HTMLString += product.key + ", ";
            }
        });
    });

    if (HTMLString == " ")
    {
        HTMLString = " None";
    }
    else
    {
        HTMLString = HTMLString.slice(0, -2);
    }

    return HTMLString;
}

function removeLocation(locationKey)
{
    //remove from products
    productRef.once('value', function(products){
        products.forEach(function(product){
            productRef.child(product.key).child(locationKey).remove();
        });
    });
    locationRef.child(locationKey).remove();
}

function displayProducts()
{
    productRef.on('value', function(snapshot){
        var newHTML = "<h2>Products</h2>";
        snapshot.forEach(function(product){
            newHTML += "<div class='listItem'>";
            newHTML += "<input onclick='removeProduct(\"" + product.key + "\")' class='deleteButton' value='x' type='button'>";
            newHTML += "<p>" + product.key + " : " + getLocationsByProduct(product.key) + "</p>";

            newHTML += "</div>";
        });
        document.getElementById("productList").innerHTML = newHTML;
    });
}

function getLocationsByProduct(prod)
{
    var HTMLString = " ";
    productRef.child(prod).once("value", function(locations){
        locations.forEach(function(location){
            if (location.val())
            {
                HTMLString += location.key + ", ";
            }
        });
    });

    if (HTMLString == " ")
    {
        HTMLString = " None";
    }
    else
    {
        HTMLString = HTMLString.slice(0, -2);
    }

    return HTMLString;
}

function removeProduct(productKey)
{
    //remove from locations
    locationRef.once('value', function(locations){
        locations.forEach(function(location){
            locationRef.child(location.key).child(productKey).remove();
        });
    });
    productRef.child(productKey).remove();
    inventoryRef.child(productKey).remove();
    shoppingRef.child(productKey).remove();
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
                    X: false,
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
                    X: false,
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
        return string.replace(/[\.\$\[\]\#]/gi, "").trim().toLowerCase();
    }
    else
    {
        return null;
    }
}

function showShoppingListTab()
{
    document.getElementById("ShoppingList").removeAttribute("style");
    document.getElementById("Locations").style.display = "none";
    document.getElementById("Products").style.display = "none";
    document.getElementById("Inventory").style.display = "none";
    document.getElementById("Profile").style.display = "none";
}

function showLocationsTab()
{
    document.getElementById("ShoppingList").style.display = "none";
    document.getElementById("Locations").removeAttribute("style");
    document.getElementById("Products").style.display = "none";
    document.getElementById("Inventory").style.display = "none";
    document.getElementById("Profile").style.display = "none";
}

function showProductsTab()
{
    document.getElementById("ShoppingList").style.display = "none";
    document.getElementById("Locations").style.display = "none";
    document.getElementById("Products").removeAttribute("style");
    document.getElementById("Inventory").style.display = "none";
    document.getElementById("Profile").style.display = "none";
}

function showInventoryTab()
{
    document.getElementById("ShoppingList").style.display = "none";
    document.getElementById("Locations").style.display = "none";
    document.getElementById("Products").style.display = "none";
    document.getElementById("Inventory").removeAttribute("style");
    document.getElementById("Profile").style.display = "none";
}

function showProfileTab()
{
    document.getElementById("ShoppingList").style.display = "none";
    document.getElementById("Locations").style.display = "none";
    document.getElementById("Products").style.display = "none";
    document.getElementById("Inventory").style.display = "none";
    document.getElementById("Profile").removeAttribute("style");
}
