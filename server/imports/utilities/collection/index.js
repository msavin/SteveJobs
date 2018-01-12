import { Mongo } from 'meteor/mongo'

collection = new Mongo.Collection("jobs_data");

collection._ensureIndex({
	due: 1, 
	state: 1
})

export { collection }