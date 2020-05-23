asyncForEach = async (array, callback) => {
    try{
        for (let index = 0 ; index < array.length; index++) {
            await callback(array[index], index, array)
            // console.log(array[index], 'i have been called')
        }
    }catch(e){
        return e.message
    }
}

module.exports = asyncForEach;