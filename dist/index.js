"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
require("dotenv/config");
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const main = async (seed) => {
    if (seed === 1) {
        return console.log("seed is 1");
    }
    let result = 0;
    if (await isNumberOdd(seed)) {
        result = (3 * seed) + 1;
    }
    else if (await isNumberEven(seed)) {
        result = seed / 2;
    }
    else {
        throw new Error(seed + " seed is neither odd or even");
    }
    await saveResultToDatabase(seed, result);
    if (await resultAlreadyCalculated(result)) {
        await findPathToOne(seed, result);
    }
    else {
        await addResultToQueue(result);
    }
    console.log("result is ", result);
    return;
};
const resultAlreadyCalculated = async (result) => {
    const seedObject = await findSeedInDatabase(result);
    if (seedObject === null) {
        return false;
    }
    return true;
};
const findPathToOne = async (seed, result) => {
    let currentSeed = result;
    let foundPathToOne = false;
    while (foundPathToOne === false) {
        const seedObject = await findSeedInDatabase(currentSeed);
        console.log({ ...seedObject, foundPathToOne, currentSeed });
        if (seedObject === null) {
            throw new Error(JSON.stringify(seedObject));
        }
        if (seedObject.toOne === true) {
            foundPathToOne = true;
            await setPathToOneTrue(seed);
            return;
        }
        else if (seedObject.toOne === false) {
            throw new Error(JSON.stringify(seedObject));
        }
        else {
            currentSeed = seedObject.result;
        }
    }
};
const setPathToOneTrue = async (seed) => {
    let foundToOne = false;
    let currentSeed = seed;
    while (foundToOne === false) {
        const seedObject = await findSeedInDatabase(currentSeed);
        console.log({ ...seedObject, foundToOne, currentSeed });
        if (seedObject === null) {
            throw new Error(JSON.stringify(seedObject));
        }
        if (seedObject.toOne === true) {
            return;
        }
        else if (seedObject.toOne === false) {
            throw new Error(JSON.stringify(seedObject));
        }
        else {
            setSeedToOneInDatabase(seedObject.seed);
            currentSeed = seedObject.result;
        }
    }
};
const setSeedToOneInDatabase = async (seed) => {
    await prisma.math.update({ where: { seed }, data: { toOne: true } });
};
const isNumberOdd = async (number) => number % 2 === 1;
const isNumberEven = async (number) => number % 2 === 0;
const saveResultToDatabase = async (seed, result) => {
    await prisma.math.create({ data: { seed, result } });
};
const addResultToQueue = async (result) => {
};
const findSeedInDatabase = async (seed) => {
    return prisma.math.findFirst({ where: { seed } });
};
main(5);
//# sourceMappingURL=index.js.map