const inputCol = (col, join=false, or = false) => {
    let colList = '';
    let len = col.length;
    let i = 0;
    col.forEach(element => {
        i++;
        let addJoin = join ? 'AND ': or ? 'OR ' :', ' ;
        if(i == len){
            colList += `${element} = ? `;
        }else{
            colList += `${element} = ? ${addJoin}`;
        }
    })
    return colList;
}
const insertCol = (col, dash=false) => {
    let colList = '';
    let len = col.length;
    let i = 0;
    col.forEach(element => {
        i++;
        let ins = dash ? '?' : element ;
        if(i == len){
            colList += `${ins} `;
        }else{
            colList += `${ins}, `;
        }
    })
    return colList;
}
const orderCol = (col) => {
    let colList = '';
    let len = col.length;
    let i = 0;
    try {
        col.forEach(element => {
            i++;
            if(Object.values(element)[0].toLowerCase() == 'desc' || Object.values(element)[0].toLowerCase() == 'asc' ) {
                if (i == len) {
                    colList += `${Object.keys(element)[0]} ${Object.values(element)[0].toLowerCase()} `;
                } else {
                    colList += `${Object.keys(element)[0]} ${Object.values(element)[0].toLowerCase()}, `;
                }
            }else{
                let pos = i == 1 ? 'st' : i == 2 ? 'nd' : i == 3 ? 'rd': 'th';
                throw  `incompatible ORDER BY value at ${i}${pos} element` ;
            }
        })
        return colList;
    }catch(err){
        throw err
    }
}
const likeCol = (col, join=false) => {
    let colList = '';
    let len = col.length;
    let i = 0;
    try {
        col.forEach(element => {
            i++;
            if(join) {
                if (i == len) {
                    colList += element.includes('!') ? `${element.substring(1)} NOT LIKE ? ` :
                        `${element} LIKE ? `;
                } else {
                    colList += element.includes('!') ? `${element.substring(1)} NOT LIKE ? AND ` :
                        `${element} LIKE ? AND `;
                }
            }else{
                colList += element.includes('!') ? `${element.substring(1)} NOT LIKE ? AND ` :
                    `${element} LIKE ? AND `;
            }
        })
        return colList;
    }catch(err){
        throw err
    }
}
const inCol = (col, join=false) => {
    let colList = '';
    try {
        for(let i = 0 ; i < col.length ; i++) {
            let placeholder = '';
            let times = 0;
            let cnv = parseInt(Object.values(col[i])[0], 10) ;
                if(!isNaN(cnv) ) {
                    try {
                        for (let j = 0; j < cnv; j++) {
                            if (j == cnv - 1) {
                                placeholder += `? `;
                            } else {
                                placeholder += `?, `;
                            }
                        }
                    } catch(err) {
                        throw err
                    }
                } else {
                    throw ` The ins parameter must take a number value`
                }
            if(join) {
                if (i == (col.length - 1)) {
                    colList += Object.keys(col[i])[0].includes('!') ? `${Object.keys(col[i])[0].substring(1)} NOT IN 
                    ( ${placeholder}) ` : ` ${Object.keys(col[i])[0]} IN ( ${placeholder}) `;
                } else {
                    colList += Object.keys(col[i])[0].includes('!') ? `${Object.keys(col[i])[0].substring(1)} NOT IN ( ${placeholder}) AND ` :
                        `${Object.keys(col[i])[0]} IN ( ${placeholder}) AND `;
                }
            }else{
                colList += Object.keys(col[i])[0].includes('!') ? `${Object.keys(col[i])[0].substring(1)} NOT IN ( ${placeholder}) AND ` :
                    `${Object.keys(col[i])[0]} IN ( ${placeholder}) AND `;
            }
        }
        return colList;
    }catch(err){
        throw err
    }
}
const joinCol = (tab,onJoin) => {
    try{
        let colList = '';
        for (let i = 0; i < tab.length; i++) {
            if(i == 0) {
                colList+=`${tab[i]} `
            }else{
                let x = i - 1;
                let onArray = onJoin[x];
                colList+=`JOIN ${tab[i]} ON ${Object.keys(onArray)[0]} = ${Object.values(onArray)[0]} `
            }
        }
        return colList;
    }catch(err){
        throw err
    }
}
module.exports = {
    insert : (tab,col) => {
        if(Array.isArray(col)){
            let colList = insertCol(col);
            let colValue = insertCol(col, true);
            let sql = `INSERT INTO ${tab} (${colList}) VALUES(${colValue})`;
            return (sql);
        }else{
            throw `2nd parameter must be an array`;
        }
    },
    update : (tab, col, id) => {
        if(Array.isArray(col) && Array.isArray(id)) {
            let colList = inputCol(col);
            let idList = inputCol(id, true);
            let i = 0;
            let si = 0 ;
            let sql = `UPDATE ${tab} SET ${colList} WHERE ${idList}`;
            return (sql);
        } else {
            throw `2nd and 3rd parameter ust be an array`
        }
     },
     selectWhere : (tab, col, id =false, order=false, limit=false, distinct=false,
                          like=false, ins=false, ors=false) => {
         if(Array.isArray(col)) {
             let colList = insertCol(col);
             let idList = id ? Array.isArray(id) ? ors ? inputCol(id, true, true) : inputCol(id, true) : false : false ;
             let likeList = like ? Array.isArray(like) ? idList ? likeCol(like) : likeCol(like, 1) : false : false ;
             let inList = ins ? Array.isArray(ins) ? idList || likeList ? inCol(ins) : inCol(ins, 1) : false : false ;
             let dist = distinct ? 'DISTINCT ' : '' ;
             let where = id || like || ins ? 'WHERE ' : '' ;
         let sql = `SELECT ${dist}${colList}FROM ${tab} ${where}`;
         if (inList) {
             sql+=`${inList} `
         }
         if(likeList) {
             sql+=`${likeList} `
         }
         if(idList){
             sql+=`${idList} `
         }
         let orderBy = order ? Array.isArray(order) ? orderCol(order) : false : false ;
         if(orderBy){
             sql+=`ORDER BY ${orderBy} `;
         }
         let limitBy = limit ? Array.isArray(limit) ? insertCol(limit) : false : false ;
         if(limitBy){
             sql+=`LIMIT BY ${limitBy} `;
         }
         return (sql);
         } else {
             throw `field parameter must be an array`
         }
     },
     join : (tab, col,on, id =false, order=false, limit=false, distinct=false,
                         like=false, ins=false) => {
         if(Array.isArray(tab) && Array.isArray(col) && Array.isArray(on)) {
             let colList = insertCol(col);
             let dist = distinct ? ' DISTINCT' : '' ;
             let colJoin = joinCol(tab, on);
             let idList = id ? Array.isArray(id) ? inputCol(id, true) : false : false ;
             let likeList = like ? Array.isArray(like) ? idList ? likeCol(like) : likeCol(like, 1) : false : false ;
             let inList = ins ? Array.isArray(ins) ? idList || likeList ? inCol(ins) : inCol(ins, 1) : false : false ;
             let where = id || like || ins ? 'WHERE ' : '' ;
             let sql = `SELECT${dist} ${colList} FROM ${colJoin}${where}`;
             if (inList) {
                 sql+=`${inList} `
             }
             if(likeList) {
                 sql+=`${likeList} `
             }
             if(idList){
                 sql+=`${idList} `
             }
             let orderBy = order ? Array.isArray(order) ? orderCol(order) : false : false ;
             if(orderBy){
                 sql+=` ORDER BY ${orderBy}`;
             }
             let limitBy = limit ? Array.isArray(limit) ? insertCol(limit) : false : false ;
             if(limitBy){
                 sql+=` LIMIT BY ${limitBy}`;
             }
             return (sql);
         }else{
             throw `1st, 2nd, 3rd parameter must be an array`
         }
     },
    deletes : (tab, id) => {
        if(Array.isArray(id)){
            try{
                let idList = inputCol(id,1);
                let sql = `DELETE FROM ${tab} WHERE ${idList}`;
                return sql;
            }catch(err){
                throw err
            }
        }else{
            throw `2nd parameter should be an array`
        }
    }
}

// console.log(insert('user', ['Email','Password']));
// console.log(update('user', ['Email','Password'], ['Id','Email']));
// console.log(selectWhere('user', ['*'], ['Email','Id'],[{Email: 'DESC'} , {Id: 'ASC'}], [0,10], 1,
//     ['!Email','Id'], [{'Email': '3'}]));
// console.log(join(['user','friends','location','follwer'], ['user.Id','user.Loaction','friends.place'],[{'user.id': 'friends.Id'},
//         {'location.Id': 'friends.Id'},{'follwer.id':'user.Id'}], ['Email','Id'],[{Email: 'DESC'} , {Id: 'ASC'}], [0,10], 1,
//     ['!Email','Id'], [{'Email': '3'}]));
// console.log(deletes('user', ['Email','Password']));
