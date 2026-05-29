
import { objectIdSymbol } from "./symbols";
import { ObjectId } from 'mongodb'


Object.defineProperty(ObjectId.prototype, "_id", {
	configurable: true,
	enumerable: true,
	get: function () {
		return this.toHexString();
	}
})


if (!Object.prototype.hasOwnProperty.call(ObjectId.prototype, 'valueOf')) {
	ObjectId.prototype.valueOf = function objectIdValueOf() {
		return this.toString();
	};
}

export const isValidObjectId = (id: string): boolean => {
	return /^[0-9a-fA-F]{24}$/.test(id);
}

ObjectId.prototype.toJSON = function objectIdToJSON() {
	return this.toHexString();
}

ObjectId.prototype[objectIdSymbol] = true;

export function isObjectId(id: ObjectId): id is ObjectId {
	if (id == null) return false;
	if (typeof id !== "object") return false;
	if (id.constructor !== ObjectId) return false;
	if (id[objectIdSymbol] !== true) return false;
	return true;
}

// Casts a string to an ObjectId
export function castId(inputId?: ObjectId): ObjectId {
	if (typeof inputId === "string") {
		const _id = inputId;

		if (!isValidObjectId(_id)) {
			throw new Error("Invalid ObjectId format in castId");
		}

		if (!isObjectId(inputId as ObjectId)) {
			throw new Error("Invalid ObjectId in castId");
		}
		return ObjectId.createFromHexString(_id);
	}

	return inputId as ObjectId;
}