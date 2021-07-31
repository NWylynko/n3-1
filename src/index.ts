import 'source-map-support/register';
import 'dotenv/config'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

import { PubSub } from '@google-cloud/pubsub'
const pubsub = new PubSub({projectId: 'wylynko-208cd'});

const pub = pubsub.topic('projects/wylynko-208cd/topics/math')
const sub = pub.subscription('projects/wylynko-208cd/subscriptions/math-sub')

sub.on('message', async (event) => {
  event.ack();
  const { seed } = JSON.parse(event.data.toString())
  await main(seed)
})

interface SeedObject {
  seed: number;
  result: number;
  toOne: boolean | null;
}

const main = async (seed: number) => {

  if (seed === 1) {
    return console.log("seed is 1")
  }

  let result = 0;

  if (await isNumberOdd(seed)) {
    result = (3 * seed) + 1
  }

  else if (await isNumberEven(seed)) {
    result = seed / 2
  }

  else {
    throw new Error(seed + " seed is neither odd or even")
  }

  await saveResultToDatabase(seed, result);

  if (await resultAlreadyCalculated(result)) {
    await findPathToOne(seed, result)
  } else {
    await addResultToQueue(result);
  }

  console.log("result is ", result)

  pub.publish(Buffer.from(JSON.stringify({ seed: result })));

  return;

}

const resultAlreadyCalculated = async (result: number) => {

  const seedObject = await findSeedInDatabase(result)

  if (seedObject === null) {
    return false
  }

  return true;

}

const findPathToOne = async (seed: number, result: number) => {

  let currentSeed = result;
  let foundPathToOne = false;

  while (foundPathToOne === false) {
    const seedObject = await findSeedInDatabase(currentSeed)

    console.log({ ...seedObject, foundPathToOne, currentSeed })

    if (seedObject === null) {
      throw new Error(JSON.stringify(seedObject))
    }

    if (seedObject.toOne === true) {

      foundPathToOne = true;

      await setPathToOneTrue(seed);

      return;

    } else if (seedObject.toOne === false) {
      throw new Error(JSON.stringify(seedObject))
    } else {
      currentSeed = seedObject.result
    }

  }

}

const setPathToOneTrue = async (seed: number) => {
  let foundToOne = false;
  let currentSeed = seed;

  while (foundToOne === false) {
    const seedObject = await findSeedInDatabase(currentSeed);

    console.log({ ...seedObject, foundToOne, currentSeed })

    if (seedObject === null) {
      throw new Error(JSON.stringify(seedObject))
    }

    if (seedObject.toOne === true) {
      // done
      return;
    } else if (seedObject.toOne === false) {
      throw new Error(JSON.stringify(seedObject))
    } else {
      setSeedToOneInDatabase(seedObject.seed);
      currentSeed = seedObject.result
    }

  }

}

const setSeedToOneInDatabase = async (seed: number) => {
  await prisma.math.update({ where: { seed }, data: { toOne: true }})
}

// is number odd
const isNumberOdd = async (number: number) => number % 2 === 1

// is number even
const isNumberEven = async (number: number) => number % 2 === 0

const saveResultToDatabase = async (seed: number, result: number) => {
  await prisma.math.create({ data: { seed, result } })
}

const addResultToQueue = async (result: number) => {
  //
}

const findSeedInDatabase = async (seed: number): Promise<SeedObject | null> => {
  return prisma.math.findFirst({ where: { seed }})
}

main(5)