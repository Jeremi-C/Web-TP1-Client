//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderFavorites();
    renderType();
    $('#createFavorite').on("click", async function () {
        saveContentScrollPosition();
        renderCreateFavoriteForm();
    });
    $('#abort').on("click", async function () {
        renderFavorites($("#selected").parent()[0].id);
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('.type').on("click", function (event) {
        renderFavorites(event.target.id);
        renderType(event.target.id);
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createFavorite").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de pages favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de de favoris comme premier
                    travaille de 420KBGLG
                </p>
                <p>
                    Auteur: Jérémi Chrétien
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderFavorites(typeSearched) {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createFavorite").show();
    $("#abort").hide();
    let favorites = await API_GetFavorites();
    eraseContent();
    if (favorites !== null) {
        if(typeSearched == undefined || typeSearched == "type_All"){
            favorites.forEach(favorite => {
                $("#content").append(renderFavorite(favorite));
            });
        }
        else{
            let type = typeSearched.split("_")[1];
            favorites.forEach(favorite => {
                if(type == favorite.Type)
                $("#content").append(renderFavorite(favorite));
            });
        }
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditFavoriteForm(parseInt($(this).attr("editFavoriteId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteFavoriteForm(parseInt($(this).attr("deleteFavoriteId")));
        });
    } else {
        renderError("Service introuvable");
    }
}
async function renderType(typeSearched){
    let favorites = await API_GetFavorites();
    let types = [...new Set(favorites.map(favorite => favorite.Type))];
    types.sort().reverse();
    $("#typeWrap").empty();
    $("#typeWrap").append('<div class="dropdown-item type" id="type_All">Tout Afficher</div><div class="dropdown-divider" id="dividerType"></div>');
    types.forEach(element => {
        $("#dividerType").after('<div class="dropdown-item type" id="type_' + element + '">' + element + '</div>');
    });
    if(typeSearched == undefined || typeSearched == "type_All")
        $("#type_All").prepend('<i class="menuIcon fas fa-check mx-2" id="selected"></i>');
    else
        $("#"+typeSearched).prepend('<i class="menuIcon fas fa-check mx-2" id="selected"></i>');

    $('.type').on("click", function (event) {
        event.stopPropagation();
        event.stopImmediatePropagation();
        renderFavorites(event.target.id);
        renderType(event.target.id);
    });
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateFavoriteForm() {
    renderFavoriteForm();
}
async function renderEditFavoriteForm(id) {
    showWaitingGif();
    let favorite = await API_GetFavorite(id);
    if (favorite !== null)
        renderFavoriteForm(favorite);
    else
        renderError("Favorite introuvable!");
}
async function renderDeleteFavoriteForm(id) {
    showWaitingGif();
    $("#createFavorite").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let favorite = await API_GetFavorite(id);
    eraseContent();
    if (favorite !== null) {
        $("#content").append(`
        <div class="favoritedeleteForm">
            <h4>Effacer le favori suivant?</h4>
            <br>
            <div class="favoriteRow" favorite_id=${favorite.Id}">
                <div class="favoriteContainer">
                    <div class="favoriteLayout">
                    <div class="small-favicon"
                    style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${favorite.Url}');">
                    </div>
                    <p class="favoriteName">${favorite.Name}</p>
                    <br>
                    <span class="favoriteType">${favorite.Type}</span>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteFavorite" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteFavorite').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteFavorite(favorite.Id);
            if (result)
            {
                renderFavorites();
                renderType($("#selected").parent()[0].id);
            }
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderFavorites();
        });
    } else {
        renderError("Favorite introuvable!");
    }
}
function newFavorite() {
    favorite = {};
    favorite.Id = 0;
    favorite.Name = "";
    favorite.Type = "";
    favorite.Url = "";
    return favorite;
}
function renderFavoriteForm(favorite = null) {
    $("#createFavorite").hide();
    $("#abort").show();
    eraseContent();
    let create = favorite == null;
    if (create) favorite = newFavorite();
    $("#actionTitle").text(create ? "Création" : "Modification");
    if(favorite.Url != "")
        $("#content").append(`
            <div class="big-favicon faviconImg" id="imgUrl"
                style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${favorite.Url}');">
            </div>`);
    else{
        $("#content").append(`
        <div class="big-favicon faviconImg" id="imgUrl"
                style="background-image: url('star-svgrepo-com.svg');">
            </div>`);
    }
    $("#content").append(`
        <form class="form" id="favoriteForm">
            <input type="hidden" name="Id" value="${favorite.Id}"/>

            <label for="Name" class="form-label">Nom </label>
            <input 
                class="form-control Alpha"
                name="Name" 
                id="Name" 
                placeholder="Nom"
                required
                RequireMessage="Veuillez entrer un nom"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${favorite.Name}"
            />
            <label for="Type" class="form-label">Catégorie </label>
            <input
                class="form-control Type"
                name="Type"
                id="Type"
                placeholder="Catégorie"
                required
                RequireMessage="Veuillez entrer le type" 
                InvalidMessage="Veuillez entrer un type valide"
                value="${favorite.Type}" 
            />
            <label for="Url" class="form-label">Lien </label>
            <input 
                class="form-control URL"
                name="Url"
                id="Url"
                placeholder="https://_____________.___"
                required
                RequireMessage="Veuillez entrer le lien du site" 
                InvalidMessage="Veuillez entrer un lien valide"
                value="${favorite.Url}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveFavorite" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $("#Url").on("blur", function() {
        $("#imgUrl").css("background-image",
        $("#Url").val() != ""? "url('http://www.google.com/s2/favicons?sz=64&domain=" + $("#Url").val() + "')":"url('star-svgrepo-com.svg')");
      } );
    $('#favoriteForm').on("submit", async function (event) {
        event.preventDefault();
        let favorite = getFormData($("#favoriteForm"));
        favorite.Id = parseInt(favorite.Id);
        showWaitingGif();
        let result = await API_SaveFavorite(favorite, create);
        if (result){
            renderFavorites();
            renderType($("#selected").parent()[0].id);
        }
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderFavorites();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderFavorite(favorite) {
    return $(`
     <div class="favoriteRow" favorite_id=${favorite.Id}">
        <div class="favoriteContainer noselect">
            <a class="favoriteLayout" target="_blank" href="${favorite.Url}">
                <div class="small-favicon"
                    style="background-image: url('http://www.google.com/s2/favicons?sz=64&domain=${favorite.Url}');">
                </div>
                <span class="favoriteName">${favorite.Name}</span>
                <br>
                <span class="favoriteType">${favorite.Type}</span>
            </a>
            <div class="favoriteCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editFavoriteId="${favorite.Id}" title="Modifier ${favorite.Name}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteFavoriteId="${favorite.Id}" title="Effacer ${favorite.Name}"></span>
            </div>
        </div>
    </div>           
    `);
}