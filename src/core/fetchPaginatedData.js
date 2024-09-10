import { collection, endBefore, getDocs, limit, limitToLast, orderBy, query, startAfter, where } from 'firebase/firestore'
import { firestore } from '../config/firebase'


export default async function fetchPaginatedData(entity_object) {
    const {
        collection: collectionName,
        records_limit, pageAction, page, fields, orderByField, 
        orderByOrder, whereFields, lastIndex: afterThis, firstIndex: beforeThis,
    } = entity_object;

    const collectionRef = collection(firestore, collectionName);
    let queryRef = query(collectionRef);

    if(whereFields && whereFields.length > 0){
        whereFields.forEach((whereObj) => {
            queryRef = query(queryRef, where(whereObj.name, '==', whereObj.value));
        });
    }

    if(page > 1){
        if(pageAction === "NEXT"){
            console.log("lastVisibleRecord (for next): ", afterThis);
            queryRef = query(collectionRef, orderBy(orderByField, orderByOrder), startAfter(afterThis), limit(records_limit));
        }
        if(pageAction === "PREVIOUS"){
            console.log("firstVisibleRecord (for previous): ", beforeThis);
            queryRef = query(collectionRef, orderBy(orderByField, orderByOrder), endBefore(beforeThis), limitToLast(records_limit));
        }
    } else {
        queryRef = query(collectionRef, orderBy(orderByField, orderByOrder), limit(records_limit));
    }


    const querySnapshot = await getDocs(queryRef);
    const records = querySnapshot.docs.map((doc) => {
        const record = doc.data();

        const filteredRecord = Object.keys(fields).reduce((obj, field) => {
            obj[field] = record[field];
            return obj;
        }, {});
        return filteredRecord;
    });

    return records;
}

