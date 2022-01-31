import { Mongo } from "meteor/mongo"
import { config } from "../config"

const collectionName = "jobs_data"

const initializeCollection = function () {
	let collection; 

	if (config.remoteCollection) {
		const dbDriver = new MongoInternals.RemoteCollectionDriver(config.remoteCollection);
		collection = new Mongo.Collection(collectionName, { _driver: dbDriver });
	} else {
		collection = new Mongo.Collection(collectionName);
	}

	
	if (collection.createIndex) {
		collection.createIndex({ due: 1, state: 1 });
	} else {
		collection._ensureIndex({ due: 1, state: 1 });
	}
	
	return collection;
}

export { collection, initializeCollection }