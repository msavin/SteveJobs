import { Mongo } from "meteor/mongo"
import { config } from "../config"

let collection; 

const initializeCollection = async function () {
	if (config.remoteCollection) {
		const dbDriver = new MongoInternals.RemoteCollectionDriver(config.remoteCollection);
		collection = new Mongo.Collection(config.collectionName, { _driver: dbDriver });
	} else {
		collection = new Mongo.Collection(config.collectionName);
	}

	await collection.createIndexAsync({ due: 1, state: 1 });
	
	return collection;
}

export { collection, initializeCollection }