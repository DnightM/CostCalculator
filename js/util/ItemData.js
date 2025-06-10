// class ItemData {
//     data;
//     /*
//         {
//             1:node,
//             2:node
//             ...
//         }
//
//         node
//         {
//             id:1,
//             name:"sample",
//             cost:100, // 원가
//             salesPrice:100, // 판매비용
//             quantity:10, // 수량(용량)
//             type:"g" // g=group, i=item, m=material
//             children:{}, // children {2: {id:2, quantity:10}, ... }
//         }
//      */
//
//     idManager = new IdManager();
//     urlDataManager = new UrlDataManger();
//
//     _TYPE_GROUP = 'g';
//     _TYPE_ITEM = 'i';
//     _TYPE_MATERIAL = 'm';
//
//     constructor(data = {}) {
//         this.data = data;
//         for (const id of Object.keys(data)) {
//             this.idManager.add(id);
//         }
//
//         const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this));
//
//         methodNames.forEach(methodName => {
//             if (methodName.startsWith('create')
//                 || methodName.startsWith('delete')
//                 || methodName.startsWith('modify')
//                 || methodName === 'add'
//                 || methodName === 'remove'
//             ) {
//                 const originalMethod = this[methodName];
//
//                 // 메서드 래핑
//                 this[methodName] = function (...args) {
//                     console.time(`${methodName} Time`);
//                     const result = originalMethod.apply(this, args);
//                     console.timeEnd(`${methodName} Time`);
//
//                     console.time(`url save Time`);
//                     this.urlDataManager.saveToUrl(this.data);
//                     console.timeEnd(`url save Time`);
//
//                     return result;
//                 }.bind(this);
//
//             }
//         });
//     }
//
//     createGroup(groupName) {
//         const groupId = this.idManager.createId();
//         this.data[groupId] = {
//             id: groupId,
//             name: groupName,
//             type: this._TYPE_GROUP,
//             children: {}
//         };
//         return groupId;
//     }
//
//     deleteGroup(groupId) {
//         // 하위 매뉴도 다 지워짐
//         delete this.data[groupId]
//     }
//
//     modifyGroup(groupId, groupName) {
//         this.data[groupId].name = groupName;
//     }
//
//     createItem(itemName, salesPrice, quantity = 1) {
//         const itemId = this.idManager.createId();
//         this.data[itemId] = {
//             id: itemId,
//             name: itemName,
//             salesPrice: salesPrice,
//             quantity: quantity,
//             type: this._TYPE_ITEM,
//             children: {}
//         };
//         return itemId;
//     }
//
//     deleteItem(itemId) {
//         delete this.data[itemId];
//
//         for (const id in this.data) {
//             delete this.data[id].children?.[itemId];
//         }
//     }
//
//     modifyItem(itemId, {name, salesPrice, quantity}) {
//         const item = this.data[itemId];
//         if (!item || item.type !== this._TYPE_ITEM) return;
//         if (name !== undefined) item.name = name;
//         if (salesPrice !== undefined) item.salesPrice = salesPrice;
//         if (quantity !== undefined) item.quantity = quantity;
//     }
//
//     createMaterial(name, cost, quantity = 1) {
//         const materialId = this.idManager.createId();
//         this.data[materialId] = {
//             id: materialId,
//             name: name,
//             cost: cost,
//             quantity: quantity,
//             type: this._TYPE_MATERIAL,
//             children: {}
//         };
//         return materialId;
//     }
//
//     deleteMaterial(materialId) {
//         delete this.data[materialId];
//
//         // 연결된 부모 노드에서도 제거
//         for (const id in this.data) {
//             delete this.data[id].children?.[materialId];
//         }
//     }
//
//     modifyMaterial(materialId, {name, cost, quantity}) {
//         const mat = this.data[materialId];
//         if (!mat || mat.type !== this._TYPE_MATERIAL) return;
//         if (name !== undefined) mat.name = name;
//         if (cost !== undefined) mat.cost = cost;
//         if (quantity !== undefined) mat.quantity = quantity;
//     }
//
//     add(parentId, childId, quantity) {
//         if (quantity) {
//             this.data[parentId].children[childId] = {
//                 id: childId,
//                 quantity: quantity
//             }
//         } else {
//             this.data[parentId].children[childId] = {
//                 id: childId,
//             }
//         }
//     }
//
//     remove(parentId, childId) {
//         delete this.data[parentId].children[childId];
//     }
// }