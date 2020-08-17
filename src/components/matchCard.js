import React, { useContext, useState } from "react"
import PropTypes from "prop-types";

import {
  Button
 } from "semantic-ui-react";

 import { AuthContext } from "../context/authContext";
 import { useMatches } from "../context/matchesContext";

 import ErrorContainer from "./errorContainer";

 const MatchCard = props => {
  const {
    requesterId,
    addresseeId,
    firstName,
    lastName,
    photoLink,
    city,
    stateCode,
    createdAt,
    leftBtnIcon,
    leftBtnContent,
    leftBtnAction,
    leftBtnValue,
    rightBtnIcon,
    rightBtnContent,
    rightBtnAction,
    rightBtnValue
  } = props;
  
  const context = useContext(AuthContext);
  const {authTokens: token } = context;

  const { matches, setMatches } = useMatches();

  let pl = null;

  if(photoLink) {
    let pub = null;
    const slash = photoLink.indexOf("/");

    slash === -1 ? pub = "public\\" : pub = "public/";
    pl = photoLink.replace(pub, "")
  }

  const [isError, setIsError] = useState(false);
  const [isErrorHeader, setIsErrorHeader] = useState(null);
  const [isErrorMessage, setIsErrorMessage] = useState(null)

  const postAction = (action, value) => {
    if(action === "updateStatus") {
      const status = parseInt(value);
      // TODO: Need to update context based on status...
      const actionData = {
        requesterId,
        addresseeId,
        status,
        actionUserId: requesterId,
      }

      fetch(`${process.env.REACT_APP_API_URL}/api/relationships/status/update`, {
        method: "put",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(actionData)
      }).then(response => {
        return response.json();
      }).then(data => {
        if (data.status !== 200)
          {
            setIsError(true);
            setIsErrorHeader("Realtionship Not Updated");
            setIsErrorMessage(data.message);
          } else {
            setIsError(false);
            // Find the addressee in the list of matches
            const { matchesResult } = matches;
            const addresseeIndex = matchesResult.map(item => {return item.addresseeId}).indexOf(addresseeId);
            // Change the status as appropriate
            matchesResult[addresseeIndex].status = status
            setMatches({ matchesResult });
          }
      }).catch(error => {
        console.log("ERROR:", error)
          setIsError(true);
          setIsErrorHeader("Network Error");
          setIsErrorMessage("Something went wrong when fetching data from the server. Please try again later.");
      });
    } else if(action === "composeEmail") {
      // const addressee = parseInt(value);
    }
  }

  return(
    <>
      <ErrorContainer
        header={isErrorHeader}
        message={isErrorMessage}
        show={isError}
      />
      <div className="match-card-profile photo">
        { photoLink ? ( <img src={pl} width="100px" height="auto" alt={firstName} /> ) : ( <i className="fas fa-user-circle"></i> ) }
      </div>
      <div className="match-card-full-name">
        {firstName} {lastName}
      </div>
      <div className="match-card-address">
        {city}, {stateCode}
      </div>
      <div className="match-card-joined">
        Member Since: {createdAt}
      </div>
      <div className='match-card-actions'>
        <Button
          type="button"
          size="tiny"
          color="yellow"
          icon={leftBtnIcon}
          content={leftBtnContent}
          onClick={() => postAction(leftBtnAction, leftBtnValue)}
        >
        </Button>
        <Button
          type="button"
          size="tiny"
          color="yellow"
          icon={rightBtnIcon}
          content={rightBtnContent}
          onClick={() => postAction(rightBtnAction, rightBtnValue)}
        >
        </Button>
      </div>
    </>
  )
 }

MatchCard.defaultProps = {
  requesterId: -99,
  addresseeId: -99,
  firstName: "John",
  lastName: "Doe",
  photoLink: "",
  city: "New York",
  stateCode: "NY",
  createdAt: "March 2019",
  leftBtnIcon: "",
  leftBtnContent: "",
  leftBtnAction: "",
  leftBtnValue: 0,
  rightBtnIcon: "",
  rightBtnContent: "",
  rightBtnAction: "",
  rightBtnValue: 0
}

const { number, string } = PropTypes;

MatchCard.propTypes = {
  requesterId: number,
  addresseeId: number,
  firstName: string,
  lastName: string,
  photoLink: string,
  city: string,
  stateCode: string,
  createdAt: string,
  leftBtnIcon: string,
  leftBtnContent: string,
  leftBtnAction: string,
  leftBtnValue: number,
  rightBtnIcon: string,
  rightBtnContent: string,
  rightBtnAction: string,
  rightBtnValue: number
}
 export default MatchCard;
