import { Mongo } from "meteor/mongo"
import { config } from "../config"

var collectionName = "jobs_data"

var initializeCollection = function () {
	var collection; 

	if (config.remoteCollection) {
		var dbDriver = new MongoInternals.RemoteCollectionDriver(config.remoteCollection);
		collection = new Mongo.Collection(collectionName, { _driver: dbDriver });
	} else {
		collection = new Mongo.Collection(collectionName);
	}

	collection._ensureIndex({ due: 1, state: 1 })

	return collection;
}

export { collection, initializeCollection }