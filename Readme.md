## Development:
Run: yarn start
<br>
Test: yarn run test

## Release Assistance Bot: Functional  description

#### 1.	Let’s set our Release Managers
<img src="assets/1. channel topic change dialog.png?raw=true" alt="1. channel topic change dialog" width="400"/>

#### 1.1.	RAB   is able to listen to Release Channel(9) topic change event and extract users mentioned in the topic text. It will store Release Managers(9) and notify about action User and Release Managers in the Release Channel.
<img src="assets/1.1. release manager channel view.png?raw=true" alt="1.1. release manager channel view" width="300"/>

#### 1.2.	RAB   will notify Release Managers.
<img src="assets/1.2 release manager manager view.png?raw=true" alt="1.2 release manager manager view" width="300"/>
 
#### 2.	Let’s make a Release Request by running /ra-request Slack command.

#### 2.1.	RAB   will open a Release Request form.
<img src="assets/2.1. request form.png?raw=true" alt="2.1. request form" width="300"/>

#### 2.2.	RAB   will confirm action User about the request.
<img src="assets/2.2. request user confirmation.png?raw=true" alt="2.2. request user confirmation" width="400"/>

#### 2.3.	RAB   will create a Request File in the Release Channel for later reference.
<img src="assets/2.3. request file.png?raw=true" alt="2.3. request file" width="400"/>

#### 2.4.	RAB   will notify Release Managers about the request.
<img src="assets/2.4. request manager view.png?raw=true" alt="2.4. request manager view" width="300"/>

#### 3.	Release Managers can Approve(3.1) or Reject(3.3) the Release Request.

#### 3.1.	If Release Managers approve the request, RAB   will add a comment on the Request File. Approver and request User will be tagged in the comment. 
<img src="assets/3.1. request initiate comment view.png?raw=true" alt="3.1. request initiate comment view" width="400"/>

#### 3.2.	RAB   will send a message to Release Managers provided with all necessary information to proceed the deployment. It will fetch current production Commit Id and attach it in the instruction. It is important to note the Branch name, and it will be used to detect the deployment progress in next steps(4).
<img src="assets/3.2. request initiate manager view.png?raw=true" alt="3.2. request initiate manager view" width="400"/>

#### 3.3.	If Release Managers reject the request, RAB   will add a comment on the Request File. Rejecter and request User will be tagged in the comment.
<img src="assets/3.3. manager rejected request comment.png?raw=true" alt="3.3. manager rejected request comment" width="300"/>

#### 3.4.	RAB   will notify other Release Managers about this rejection.
<img src="assets/3.4. manager rejected request manager view.png?raw=true" alt="3.4. manager rejected request manager view" width="400"/>

#### 4.	RAB   is able to listen to Jenkins   build events from Deploy Channel(9). It is also able to simulate Branch(8.1), Staging(8.2) and Production Build(8.3) for testing purpose.
 
#### 4.1.	When the Branch build success message which is posted by Jenkins   in Deploy Channel, RAB   will notify Release Managers. They can promote this build to Staging by clicking the button attached. RAB   will use previously generated branch name to track the correct build.
<img src="assets/4.1. branch build manager view.png?raw=true" alt="4.1. branch build manager view" width="400"/>

#### 4.2.	RAB   will notify release managers if Staging build success message is posted by Jenkins   in the Deploy Channel. They can promote this build to Production by clicking the button attached.
<img src="assets/4.2. staging build manager view.png?raw=true" alt="4.2. staging build manager view" width="400"/>

#### 4.3.	RAB   will also notify to the Release Channel to inform the progress and will tag the respective Users to confirm this build contains correct things from their Release Request. They can mark it as Correct(4.4) or Incorrect(4.8) build.
<img src="assets/4.3. staging build file comment view.png?raw=true" alt="4.3. staging build file comment view" width="400"/>

#### 4.4.	When a User confirms the update about this build, RAB   will notify it to the Release Managers.
<img src="assets/4.4. staging confirmed manager view.png?raw=true" alt="4.4. staging confirmed manager view" width="400"/>

#### 4.5.	RAB   will also send a confirmation message to the action User.
<img src="assets/4.5. staging confirmed user view.png?raw=true" alt="4.5. staging confirmed user view" width="400"/>

#### 4.6.	RAB   add a comment to show the confirmation in the Release Channel.
<img src="assets/4.6. staging confirmed comment view.png?raw=true" alt="4.6. staging confirmed comment view" width="400"/>

#### 4.7.	When the Production build success message is posted by Jenkins   in Deploy Channel, RAB   will post a message in the Release Channel to notify all.
<img src="assets/4.7. production build release channel view.png?raw=true" alt="4.7. production build release channel view" width="400"/>

#### 4.8.	When a User mark this build as Incorrect, RAB   will notify it to the User.
<img src="assets/4.8. staging incorrect user view.png?raw=true" alt="4.8. staging incorrect user view" width="400"/>

#### 4.9.	RAB   will notify it to the Release Managers.
<img src="assets/4.9. staging incorrect manager view.png?raw=true" alt="4.9. staging incorrect manager view" width="400"/>

#### 4.10.	RAB    will notify it to the Request File comment.
<img src="assets/4.10. staging incorrect comment view.png?raw=true" alt="4.10. staging incorrect comment view" width="400"/>

#### 5.	User can track any request Progress at any time by running /ra-progress [-i request-id] command.

#### 5.1.	User can cancel any request by running /ra-progress -i [request-id] --cancel command. RAB   will prompt for confirmation.
<img src="assets/5.1. request progress.png?raw=true" alt="5.1. request progress" width="300"/>

#### 5.2.	RAB   will notify Release Managers.
<img src="assets/5.2. user cancel request confirm view.png?raw=true" alt="5.2. user cancel request confirm view" width="300"/>

#### 5.3.	RAB   will notify in the Request File comment.
<img src="assets/5.3. user canceled request comment view.png?raw=true" alt="5.3. user canceled request comment view" width="300"/>

#### 6.	RAB   also can assist with Daily Build. A User can send a daily report to Release Managers by running /ra-report Slack command.

#### 6.1.	RAB   will open the Daily Report form. Report Section(8) can be configured by /ra-config --update(7.2) command.
<img src="assets/6.1. report form.png?raw=true" alt="6.1. report form" width="400"/>

#### 6.2.	RAB   will confirm the action User.
<img src="assets/6.2. report user view.png?raw=true" alt="6.2. report user view" width="400"/>

#### 6.3.	RAB    will inform Daily Report to Release Managers.
<img src="assets/6.3. report manager view.png?raw=true" alt="6.3. report manager view" width="400"/>

#### 6.4.	RAB   will inform daily report to Release Channel.
<img src="assets/6.4. report channel view.png?raw=true" alt="6.4. report channel view" width="400"/>

#### 6.5.	When all Report Sections are reported RAB   will inform Release Managers to promote Staging build to Production.
<img src="assets/6.5. report done manager view.png?raw=true" alt="6.5. report done manager view" width="400"/>

#### 6.6.	RAB   will notify about the Daily Production Build in the Release Channel.
<img src="assets/6.6. daily production build.png?raw=true" alt="6.6. daily production build" width="300"/>

#### 6.7.	User can get the Daily Report status at any time by running /ra-report -s command. 
<img src="assets/6.7. report status.png?raw=true" alt="6.7. report status" width="250"/>

#### 7.	State command
#### 7.1.	User can get current state by running /ra-state command
<img src="assets/7.1. state view.png?raw=true" alt="7.1. state view" width="600"/>
 
#### 7.2.	User can update current state by running /ra-state --update command. Optionally user can preselect releaseChannel and deployChannel value using --releaseChannel #release-channel and --deployChannel #deploy-channel parameters.
<img src="assets/7.2. state form.png?raw=true" alt="7.2. state form" width="400"/>

#### 8.	RAB   dry-run commands.
#### 8.1.	/ra-dryrun –-branchBuild -b branch-name will simulate Branch build message in Deploy Channel.
<img src="assets/8.1. branch build deploy channel view.png?raw=true" alt="8.1. branch build deploy channel view" width="400"/>

#### 8.2.	/ra-dryrun –-stagingBuild -b branch-name will simulate Staging build message in Deploy Channel.
<img src="assets/8.2. staging build deploy channel view.png?raw=true" alt="8.2. staging build deploy channel view" width="400"/>

#### 8.3.	/ra-dryrun –-productionBuild -b branch-name will simulate Production build message in Deploy Channel.
<img src="assets/8.3. production build deploy channel view.png?raw=true" alt="8.3. production build deploy channel view" width="400"/>

#### 9.	Sample state:
```javascript
{
  "config": {
    "releaseChannel": {
      "id": "GEL8D0QRG",
      "name": "ra-release"
    },
    "deployChannel": {
      "id": "GFY9XRY1Z",
      "name": "ra-deploy"
    },
    "releaseManagers": [
      {
        "id": "UC29BCUN6"
      }
    ],
    "reportSections": [
      {
        "id": "landing-page",
        "label": "Landing Page"
      },
      {
        "id": "checkout",
        "label": "Checkout"
      }
    ],
    "stagingInfoUrl": "https://staging.build.net/info",
    "productionInfoUrl": "https://production.build.net/info"
  },
  "deployments": {
    "staging": {}
  },
  "dailyReport": {},
  "requests": {}
}
```


GitHub: https://github.com/jonayet/release-assistant-slack-bot
