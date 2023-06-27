import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import config from "./config/index.js";
import fakers from "./fakers.js";

const sec_year = 31556926;

// Function to connect, but databaseURL is missing
async function connect() {
  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    databaseURL: config.databaseURL,
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const database = getDatabase(app);
  const auth = getAuth();

  await signInWithEmailAndPassword(auth, config.email, config.password);
  const dbRef = ref(database, "people");
  onValue(
    dbRef,
    (snapshot) => {
      if (snapshot.exists()) {
        console.log(snapshot.val());
      } else {
        console.log("doesn't exist");
      }
    },
    (e) => {
      console.error(error);
    }
  );
}

function lowerFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function capitalize(str) {
  return str.replace(/(?:^|\s|["'([{])+\S/g, (match) => match.toUpperCase());
}

// This can probably be done in one regex but no idea how
function camelCase(country) {
  country = country.replace(/[^a-zA-Z ]/g, "");
  country = capitalize(country);
  country = country.replace(/ /g, "");
  country = lowerFirstLetter(country);
  return country;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function report(data) {
  let age_sum = 0;
  const now = Math.floor(new Date().getTime() / 1000);

  const agg = {
    total: 0,
    averageAge: 0,
    byAgeRanges: {
      "<18": 0,
      "19-29": 0, // 19 - 29 years old
      "30-45": 0, // 30 - 45
      "46-70": 0, // 46 - 70
      ">70": 0, // 71 or more
    },
    byCountry: {},
    byVehicle: {},
  };

  for (let i = 0; i < data.length; i++) {
    const person = data[i];
    let country = person.country;
    let vehicle = person.vehicle;

    country = camelCase(country);
    vehicle = camelCase(vehicle);

    if (agg.byCountry[country]) agg.byCountry[country] += 1;
    else agg.byCountry[country] = 1;

    if (agg.byVehicle[vehicle]) agg.byVehicle[vehicle] += 1;
    else agg.byVehicle[vehicle] = 1;

    const years = Math.floor((now - person.dateOfBirth) / sec_year);
    age_sum += years;
    if (years <= 18) {
      agg.byAgeRanges["<18"] += 1;
    } else if (years <= 29 && years > 18) agg.byAgeRanges["19-29"] += 1;
    else if (years <= 45 && years > 29) agg.byAgeRanges["30-45"] += 1;
    else if (years <= 70 && years > 45) agg.byAgeRanges["46-70"] += 1;
    else agg.byAgeRanges[">70"] += 1;
  }
  agg.total = data.length;
  agg.averageAge = age_sum / data.length;
  return agg;
}

//connect(database)
while (true) {
  console.log(report(fakers()));
  await sleep(2000);
}
