import request from "./index";

export async function getUserList(params) {
    return request({
        url: "/user/",
        method: "get",
        params,
    });
}

export async function login(data) {
     return request({
         url: "/user/login",
         method:"post",
         data
     })
}

export async function jwtLogin(data) {
     return request({
         url: "/jwt_login",
         method:"post",
         data
     })
}

export async function logout() {
    return request({
        url: "/user/logout",
        method: "get"
    })
}

export async function register(data) {
    return request({
        url: "/user/",
        method: "post",
        data
    })
}

export async function changePassword(data) {
    return request({
        url: "/user/pwd",
        method: "post",
        data
    })
}

export async function forgetPassword(data) {
    return request({
        url: "/user/pwd",
        method: "put",
        data
    })
}

export async function getUserDetail(userId) {
    return request({
        url: "/user/" + userId + "/",
        method: "get",
    })
}

export async function saveUser(method, data) {
    return request({
        url: "/user/" + data.id + "/",
        method,
        data,
    })
}

export async function getTagList(params) {
    return request({
        url: "/tag/",
        method: "get",
        params,
    })
}

export async function saveTag(method, data) {
    let url = "/tag/"
    if (["put", "patch"].includes(method)) {
        url += data.id + "/"
    }

    return request({
        url,
        method,
        data,
    })
}

export async function addTag(data) {
    return request({
        url: "/tag/",
        method: "post",
        data,
    })
}

export async function deleteTag(id) {
    return request({
        url: "/tag/" + id + "/",
        method: "delete",
    })
}

export async function getCatalogTree() {
    return request({
        url: "/catalog/",
        method: "get",
    })
}

export async function saveCatalog(method, data) {
    let url = "/catalog/"
    if (["put", "patch"].includes(method)) {
        url += data.id + "/"
    }
    return request({
        url,
        method,
        data,
    })
}

export async function deleteCatalog(catalogId) {
    return request({
        url: "/catalog/" + catalogId + "/",
        method: "delete",
    })
}

export async function getArticleList(params) {
    return request({
        url: "/article/",
        method: "get",
        params
    })
}

export async function getArticleDetail(articleId) {
    return request({
        url: "/article/" + articleId + "/",
        method: "get",
    })
}

export async function remoteSaveArticle(method, data) {
    let url = "/article/"
    if (["put", "patch"].includes(method)) {
        url += data.id + "/"
    }
    return request({
        url, 
        method,
        data,
    })
}

export async function getCommentList(params) {
    return request ({
        url: "/comment/",
        method: "get",
        params,
    })
}

export async function getTopArticleList() {
    return request({
        url: "/top/",
        method: "get",
    })
}

export async function getNumbers() {
    return request({
        url: "/number/",
        method: "get",
    })
}

export async function postLikeArticle(data) {
    return request ({
        url: "/like/",
        method: "post",
        data,
    })
}

export async function getArticleComments(articleId) {
    return request({
        url: "/comment/",
        method: "get",
        params: {
            article: articleId,
        },
    })
}

export async function addComment(data) {
    return request({
        url: "/comment/",
        method: "post",
        data,
    })
}

export async function getArchiveList(params) {
    return request({
        url: "/archive/",
        method: "get",
        params
    })
}

export async function getSearchArticleList(params) {
    return request({
        url: "/es/",
        method: "get",
        params
    })
}

export async function getMessageList(params) {
    return request ({
        url: "/message/",
        method: "get",
        params,
    })
}

export async function addMessage(data) {
    return request({
        url: "/message/",
        method: "post",
        data,
    })
}
