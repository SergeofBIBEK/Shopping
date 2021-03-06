var db;
var userRef;
var productRef;
var locationRef;
var inventoryRef;
var shoppingRef;


function signedInHandler()
{
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
        var newHTML = "";
        snapshot.forEach(function(item){

            var filter = document.getElementById("storeFilter").value;
            var productHasFilter;

            productRef.child(item.key).child(filter).once('value', function(store){
                productHasFilter = store.val();
            });

            if (filter == "All" || productHasFilter)
            {
                newHTML += "<div class='listItem'>";
                newHTML += "<div class='leftList'>";
                newHTML += "<input onclick='removeFromShoppingList(\"" + item.key + "\")' type='button' value='x' class='removeFromShoppingListButton'>";
                newHTML += "<p>" + item.key + "</p>";
                newHTML += "</div>";
                newHTML += "<div class='rightList'>";
                newHTML += "<input onclick='subtractOneShopping(\"" + item.key + "\")' type='button' value='-' class='minusButton'>";
                newHTML += "<p style='margin-left: 5px; margin-right: 5px;'>" + item.val() + "</p>";
                newHTML += "<input onclick='addOneShopping(\"" + item.key + "\")' type='button' value='+' class='plusButton'>";
                newHTML += "<input onclick='bought(\"" + item.key + "\")' type='button' value='Bought' class='boughtButton'>";
                newHTML += "</div>";
                newHTML += "</div>";
            }
        });
        document.getElementById("shoppingListContainer").innerHTML = newHTML;
    });
}

function removeFromShoppingList(productKey)
{
    shoppingRef.child(productKey).remove();
}

function addOneShopping(item)
{
    shoppingRef.child(item).transaction(function(total){
        return total + 1;
    });
}

function subtractOneShopping(item)
{
    shoppingRef.child(item).transaction(function(total){

        if (total == 1)
        {
            shoppingRef.child(item).remove();
            return null;
        }

        return total - 1;
    });
}

function bought(itemRef)
{
    shoppingRef.child(itemRef).once('value', function(snapshot){
        inventoryRef.child(itemRef).transaction(function(total){
            shoppingRef.child(itemRef).remove();
            return total + snapshot.val();
        });
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
        var newHTML = "";
        var filterHTML = "<option value='All'>All</option>";
        snapshot.forEach(function(location){
            newHTML += "<div class='listItem'>";
            newHTML += "<div class='leftList'>";
            newHTML += "<input onclick='removeLocation(\"" + location.key + "\")' class='deleteButton' value='x' type='button'>";
            newHTML += "<p>" + location.key + "</p>";
            newHTML += "</div>";
            newHTML += "<div class='rightList'>";
            newHTML += "<p>" + getProductsByLocation(location.key) + "</p>";
            newHTML += "<input onclick='addProductToLocation(\"" + location.key + "\")' type='button' class='changeButton' value='Edit'>";
            newHTML += "</div>    ";            
            newHTML += "</div>";

            filterHTML += "<option value='" + location.key + "'>" + location.key + "</option>";
        });
        document.getElementById("locationList").innerHTML = newHTML;
        document.getElementById("storeFilter").innerHTML = filterHTML;
        document.getElementById("inventoryFilter").innerHTML = filterHTML;
    });
}

function addProductToLocation(locationKey)
{
    var theDiv = document.getElementById("productOptions");

    theDiv.innerHTML = "";

    theDiv.removeAttribute("style");
    document.getElementById("coverAll").removeAttribute("style");

    var newSelect = document.createElement("select");
    newSelect.id = "productSelect";

    var HTMLString = "<option value='New'>New</option>";

    productRef.once('value', function(snapshot){
        snapshot.forEach(function(product){
            HTMLString += "<option value='" + product.key + "'>";
            HTMLString += product.key;
            HTMLString += "</option>";
        });
    });

    newSelect.innerHTML = HTMLString;

    theDiv.appendChild(newSelect);

    theDiv.innerHTML += "<input onclick='handlePtoL(\"" + locationKey + "\", true" + ")' type='button' value='Add' class='addButton'>";

    theDiv.innerHTML += "<input onclick='handlePtoL(\"" + locationKey + "\", false" + ")' type='button' value='Remove' class='removeButton'>";

    theDiv.innerHTML += "<input onclick='closeOptions();' type='button' value='Cancel' class='cancelButton'>";
}

function handlePtoL(locationKey, add)
{
    var addedProduct = document.getElementById("productSelect").value;

    //set item to location and set location to item

    if (addedProduct == "New")
    {
        if (!add)
        {
            return;
        }

        addedProduct =  newProduct();

        if (addedProduct == null)
        {
            return;
        }
    }

    var productUpdates = {};
    productUpdates[locationKey] = add;

    var locationUpdates = {};
    locationUpdates[addedProduct] = add;

    productRef.child(addedProduct).update(productUpdates);
    locationRef.child(locationKey).update(locationUpdates);

    closeOptions();
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
        var newHTML = "";
        snapshot.forEach(function(product){

            newHTML += "<div class='listItem'>";
            newHTML += "<div class='leftList'>";
            newHTML += "<input onclick='removeProduct(\"" + product.key + "\")' class='deleteButton' value='x' type='button'>";
            newHTML += "<p>" + product.key + "</p>";
            newHTML += "<input onclick='addToShoppingList(\"" + product.key + "\")' class='addToShoppingListButton' value='+List' type='button'>";
            newHTML += "</div>";
            newHTML += "<div class='rightList'>";
            newHTML += "<p>" + getLocationsByProduct(product.key) + "</p>";
            newHTML += "<input onclick='addLocationToProduct(\"" + product.key + "\")' type='button' class='changeButton' value='Edit'>";
            newHTML += "</div>";
            newHTML += "</div> ";

        });
        document.getElementById("productList").innerHTML = newHTML;
    });
}

function addLocationToProduct(productKey)
{
    var theDiv = document.getElementById("locationOptions");

    theDiv.innerHTML = "";

    theDiv.removeAttribute("style");
    document.getElementById("coverAll").removeAttribute("style");

    var newSelect = document.createElement("select");
    newSelect.id = "locationSelect";

    var HTMLString = "<option value='New'>New</option>";

    locationRef.once('value', function(snapshot){
        snapshot.forEach(function(location){

            HTMLString += "<option value='" + location.key + "'>";
            HTMLString += location.key;
            HTMLString += "</option>";
        });
    });

    newSelect.innerHTML = HTMLString;

    theDiv.appendChild(newSelect);

    theDiv.innerHTML += "<input onclick='handleLtoP(\"" + productKey + "\", true" + ")' type='button' value='Add' class='addButton'>";

    theDiv.innerHTML += "<input onclick='handleLtoP(\"" + productKey + "\", false" + ")' type='button' value='Remove' class='removeButton'>";

    theDiv.innerHTML += "<input onclick='closeOptions();' type='button' value='Cancel' class='cancelButton'>";
}

function handleLtoP(productKey, add)
{
    var addedLocation = document.getElementById("locationSelect").value;

    //set item to location and set location to item

    if (addedLocation == "New")
    {
        if (!add)
        {
            return;
        }

        addedLocation =  newLocation();

        if (addedLocation == null)
        {
            return;
        }
    }

    var productUpdates = {};
    productUpdates[addedLocation] = add;

    var locationUpdates = {};
    locationUpdates[productKey] = add;

    productRef.child(productKey).update(productUpdates);
    locationRef.child(addedLocation).update(locationUpdates);

    closeOptions();
}

function closeOptions()
{
    document.getElementById("shoppingOptions").style.display = "none";
    document.getElementById("locationOptions").style.display = "none";
    document.getElementById("productOptions").style.display = "none";
    document.getElementById("coverAll").style.display = "none";
}

function addToShoppingList(item)
{
    var itemObject = {};
    itemObject[item] = 1;
    shoppingRef.once('value', function(snapshot){
        if (snapshot.val() && snapshot.val()[item])
        {
            shoppingRef.child(item).transaction(function(total){
                return total + 1;
            });
        }
        else
        {
            shoppingRef.update(itemObject);
        }
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
        var newHTML = "";
        snapshot.forEach(function(inventory){

            var filter = document.getElementById("inventoryFilter").value;
            var productHasFilter;

            productRef.child(inventory.key).child(filter).once('value', function(store){
                productHasFilter = store.val();
            });

            if (filter == "All" || productHasFilter)
            {
                newHTML += "<div class='listItem'>";
                newHTML += "<div class='leftList'>";
                newHTML += "<p>" + inventory.key + "</p>";
                newHTML += "<input onclick='addToShoppingList(\"" + inventory.key + "\")' class='addToShoppingListButton' value='+List' type='button'>";
                newHTML += "</div>";
                newHTML += "<div class='rightList'>";
                newHTML += "<input type='button' class='minusButton' value='-' onclick='subtractOne(\"" + inventory.key + "\")'>";
                newHTML += "<p style='margin-left: 5px; margin-right: 5px;'>" + inventory.val() + "</p>";
                newHTML += "<input type='button' class='plusButton' value='+' onclick='addOne(\"" + inventory.key + "\")'>";
                newHTML += "</div>";
                newHTML += "</div>";
            }

        });
        document.getElementById("inventoryList").innerHTML = newHTML;
    });
}

function addOne(item)
{
    inventoryRef.child(item).transaction(function(total){
        return total + 1;
    });
}

function subtractOne(item)
{
    inventoryRef.child(item).transaction(function(total){
        return total - 1;
    });
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
    return nameResult;
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
    return nameResult;
}

function signedOutHandler()
{
    console.log("Signed Out");
}

function cleanInput(string)
{
    if (string != null)
    {
        return string.replace(/[\.\$\[\]\#']/gi, "").trim().toLowerCase();
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

function logOut()
{
    firebase.auth().signOut().then(function(){location.reload();});
}

function addNewToShoppingList()
{
    var theDiv = document.getElementById("shoppingOptions");

    theDiv.innerHTML = "";

    theDiv.removeAttribute("style");
    document.getElementById("coverAll").removeAttribute("style");

    var newSelect = document.createElement("select");
    newSelect.id = "shoppingSelect";

    var HTMLString = "<option value='New'>New</option>";

    productRef.once('value', function(snapshot){
        snapshot.forEach(function(product){

            var exists;

            shoppingRef.child(product.key).once('value', function(item){
                exists = item.exists();
            });

            if(!exists)
            {
                HTMLString += "<option value='" + product.key + "'>";
                HTMLString += product.key;
                HTMLString += "</option>";
            }
        });
    });

    newSelect.innerHTML = HTMLString;

    theDiv.appendChild(newSelect);

    theDiv.innerHTML += "<input onclick='addToShopping();' type='button' value='Add' class='addButton'>";

    theDiv.innerHTML += "<input onclick='closeOptions();' type='button' value='Cancel' class='cancelButton'>";
}

function addToShopping()
{
    var newItem = document.getElementById("shoppingSelect").value;

    //set item to location and set location to item

    if (newItem == "New")
    {

        newItem =  newProduct();

        if (newItem == null)
        {
            return;
        }
    }

    var updates = {};
    updates[newItem] = 1;

    shoppingRef.update(updates);

    closeOptions();
}

function filter()
{
    shoppingRef.update({
        X: true
    });
    shoppingRef.update({
        X: null
    });
    
    inventoryRef.update({
        X: true
    });
    inventoryRef.update({
        X: null
    });
}