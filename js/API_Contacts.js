const API_URL = "https://fearless-warm-alyssum.glitch.me/api/favorites";
//const API_URL = "http://localhost:5000/api/favorites";
function API_GetFavorites() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            success: favorites => { resolve(favorites); },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}
function API_GetFavoritesByType() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            success: favorites => { 
                let list;
                for (let object of favorites) {
                    if (object.Type === type)
                        list.add(object)
                    resolve(list);
                }
            },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}
function API_GetType() {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            success: favorites => { 
                let list;
                for (let object of favorites) {
                    if (!list.includes(object.Type))
                    list.add(object.Type)
                    resolve(list);
                }
            },
            error: (xhr) => { console.log(xhr); resolve(null); }
        });
    });
}
function API_GetFavorite(favoritesId) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + favoritesId,
            success: favorite => { resolve(favorite); },
            error: () => { resolve(null); }
        });
    });
}
function API_SaveFavorite(favorite, create) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL,
            type: create ? "POST" : "PUT",
            contentType: 'application/json',
            data: JSON.stringify(favorite),
            success: (/*data*/) => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}
function API_DeleteFavorite(id) {
    return new Promise(resolve => {
        $.ajax({
            url: API_URL + "/" + id,
            type: "DELETE",
            success: () => { resolve(true); },
            error: (/*xhr*/) => { resolve(false /*xhr.status*/); }
        });
    });
}