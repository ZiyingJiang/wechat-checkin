const cloud = require("wx-server-sdk");

cloud.init({
    env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

async function clearCollection(name){

    while(true){

        const res = await db.collection(name)
            .limit(100)
            .get();

        if(res.data.length === 0){
            break;
        }

        await Promise.all(
            res.data.map(item =>
                db.collection(name)
                  .doc(item._id)
                  .remove()
            )
        );

    }

}

exports.main = async ()=>{

    await clearCollection("checkins");
    await clearCollection("participants");
    await clearCollection("activities");

    return {
        success:true
    };

};