## Development:
Run: yarn start
<br>
Test: yarn run test

## Release Assistance Bot: Functional  description

#### 1.	Let’s set our Release Managers
<img src="assets/1. channel topic change dialog.png?raw=tru" alt="1. channel topic change dialog" width="400"/>

#### 1.1.	RAB   is able to listen to Release Channel(9) topic change event and extract users mentioned in the topic text. It will store Release Managers(9) and notify about action User and Release Managers in the Release Channel.
<img src="assets/1.1. release manager channel view.png?raw=tru" alt="1.1. release manager channel view" width="300"/>

#### 1.2.	RAB   will notify Release Managers.
<img src="assets/1.2 release manager manager view.png?raw=tru" alt="1.2 release manager manager view" width="300"/>
 
#### 2.	Let’s make a Release Request by running /ra-request Slack command.

2.1.	RAB   will open a Release Request form.
 

2.2.	RAB   will confirm action User about the request.
 

2.3.	RAB   will create a Request File in the Release Channel for later reference.
 

2.4.	RAB   will notify Release Managers about the request.
 

3.	Release Managers can Approve(3.1) or Reject(3.3) the Release Request.

3.1.	If Release Managers approve the request, RAB   will add a comment on the Request File. Approver and request User will be tagged in the comment. 
 

3.2.	RAB   will send a message to Release Managers provided with all necessary information to proceed the deployment. It will fetch current production Commit Id and attach it in the instruction. It is important to note the Branch name, and it will be used to detect the deployment progress in next steps(4).
 

3.3.	If Release Managers reject the request, RAB   will add a comment on the Request File. Rejecter and request User will be tagged in the comment.
 

3.4.	RAB   will notify other Release Managers about this rejection.
 

4.	RAB   is able to listen to Jenkins   build events from Deploy Channel(9).
It is also able to simulate Branch(8.1), Staging(8.2) and Production Build(8.3) for testing purpose.
 

4.1.	When the Branch build success message which is posted by Jenkins   in Deploy Channel, RAB   will notify Release Managers. They can promote this build to Staging by clicking the button attached. RAB   will use previously generated branch name to track the correct build.
 

4.2.	RAB   will notify release managers if Staging build success message is posted by Jenkins   in the Deploy Channel. They can promote this build to Production by clicking the button attached.
 

4.3.	RAB   will also notify to the Release Channel to inform the progress and will tag the respective Users to confirm this build contains correct things from their Release Request. They can mark it as Correct(4.4) or Incorrect(4.8) build.
 

4.4.	When a User confirms the update about this build, RAB   will notify it to the Release Managers.
 

4.5.	RAB   will also send a confirmation message to the action User.
 

4.6.	RAB   add a comment to show the confirmation in the Release Channel.
 

4.7.	When the Production build success message is posted by Jenkins   in Deploy Channel, RAB   will post a message in the Release Channel to notify all.
 

4.8.	When a User mark this build as Incorrect, RAB   will notify it to the User.
 

4.9.	RAB   will notify it to the Release Managers.
 

4.10.	RAB    will notify it to the Request File comment.
 

5.	User can track any request Progress at any time by running /ra-progress [-i request-id] command.
 

5.1.	User can cancel any request by running /ra-progress -i [request-id] --cancel command. RAB   will prompt for confirmation.
 

5.2.	RAB   will notify Release Managers.
 

5.3.	RAB   will notify in the Request File comment.
 

6.	RAB   also can assist with Daily Build. A User can send a daily report to Release Managers by running /ra-report Slack command.

6.1.	RAB   will open the Daily Report form.
Report Section(8) can be configured by /ra-config --update(7.2) command.
 

6.2.	RAB   will confirm the action User.
 

6.3.	RAB    will inform Daily Report to Release Managers.
 

6.4.	RAB   will inform daily report to Release Channel.
 

6.5.	When all Report Sections are reported RAB   will inform Release Managers to promote Staging build to Production.
 

6.6.	RAB   will notify about the Daily Production Build in the Release Channel.
 

6.7.	User can get the Daily Report status at any time by running /ra-report -s command. 

7.	State command
7.1.	User can get current state by running /ra-state command
 
7.2.	User can update current state by running /ra-state --update command.
Optionally user can preselect releaseChannel and deployChannel value using
--releaseChannel #release-channel and --deployChannel #deploy-channel parameters.
 

8.	RAB   dry-run commands.
8.1.	/ra-dryrun –-branchBuild -b branch-name will simulate Branch build message in Deploy Channel.
 

8.2.	/ra-dryrun –-stagingBuild -b branch-name will simulate Staging build message in Deploy Channel.
 

8.3.	/ra-dryrun –-productionBuild -b branch-name will simulate Production build message in Deploy Channel.
 
9.	Sample state:
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
