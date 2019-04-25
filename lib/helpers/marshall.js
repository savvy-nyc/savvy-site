const { Marshaller } = require("@aws/dynamodb-auto-marshaller");
const marshaller = new Marshaller({ onEmpty: "nullify" });
console.log(marshaller.unmarshallItemItem);
module.exports.Marshaller = Marshaller;
module.exports.marshaller = marshaller;
module.exports.unmarshall = marshaller.unmarshallItemItem;
module.exports.marshall = marshaller.marshallItemItem;
