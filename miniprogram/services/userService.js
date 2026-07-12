let cachedOpenId = null;

/**
 * 获取当前用户 OpenID
 */
export async function getOpenId() {

    if (cachedOpenId) {
        return cachedOpenId;
    }

    const res = await wx.cloud.callFunction({
        name: "login"
    });

    cachedOpenId = res.result.openId;
    //console.log("cacheOpenId in getOpenId:" cacheOpenId);

    return cachedOpenId;
}