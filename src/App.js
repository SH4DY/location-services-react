import logo from './logo.svg';
import './App.css';
import Amplify, { Auth } from 'aws-amplify';
import Location from "aws-sdk/clients/location";
import awsconfig from './aws-exports';
import ReactMapGL from "react-map-gl";
import { Signer, ICredentials} from "@aws-amplify/core";
import React from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import "./index.css";

Amplify.configure(awsconfig);

const mapName = "ems-map";

// const createClient = async () => {
//     const credentials = await Auth.currentCredentials();
//     const client = new Location({
//         credentials,
//         region: awsconfig.aws_project_region,
//    });

//    const params = {
//      IndexName: "ems-place-index",
//      Text: "Indianapolis",
//    };

//    client.searchPlaceIndexForText(params, (err, data) => {
//      if (err) console.error(err);
//      if (data) console.log(data);
//    });

//    return client;
// }

/**
 * Sign requests made by Mapbox GL using AWS SigV4.
 */
const transformRequest = (credentials) => (url, resourceType) => {
  // Resolve to an AWS URL
  if (resourceType === "Style" && !url?.includes("://")) {
    url = `https://maps.geo.eu-west-1.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
    console.log("URL izzzz "+ url);
    console.log("accesskeyid izzzz "+ credentials.accessKeyId);
    console.log("secretaccesskey izzzz "+ credentials.secretAccessKey);
    console.log("token izzzz "+ credentials.sessionToken);
  }

  // Only sign AWS requests (with the signature as part of the query string)
  if (url?.includes("amazonaws.com")) {
    return {
      url: Signer.signUrl(url, {
        access_key: credentials.accessKeyId,
        secret_key: credentials.secretAccessKey,
        session_token: credentials.sessionToken,
      }),
    };
  }

  // Don't sign
  return { url: url || "" };
};


function App() {

  // createClient();

  const [viewport, setViewport] = React.useState({
    longitude: -123.1187,
    latitude: 49.2819,
    zoom: 10,
  });

  const [credentials, setCredentials] = React.useState(
    null
  );

  React.useEffect(() => {
    const fetchCredentials = async () => {
      setCredentials(await Auth.currentUserCredentials());
    };

    fetchCredentials();
  });

  return (
    <div>
       {credentials ? (
          <ReactMapGL
          {...viewport}
          width="100%"
          height="100vh"
          transformRequest={transformRequest(credentials)}
          mapStyle={mapName}
          onViewportChange={setViewport}
          />
       ) : (
          <h1>Loading...</h1>
        )}
    </div>
  );
}

export default App;
