import { faker } from "@faker-js/faker";

//Make fake data since I can't connect to the db
export default function fakers() {
  const arr = [];
  const date = new Date().getTime();
  for (let i = 0; i < 1000; i++) {
    const person = {
      name: faker.name.findName(),
      dateOfBirth: faker.datatype.number(Math.floor(date / 1000)),
      country: faker.address.country(),
      vehicle: faker.vehicle.manufacturer(),
    };
    arr.push(person);
  }
  return arr;
}
