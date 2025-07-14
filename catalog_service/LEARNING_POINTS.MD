### agile, epic, story points, issues and tickets
 - this video https://www.youtube.com/watch?v=UqWbLQxUxhQ&list=PLaLqLOj2bk9aaZZYoH7tMDj5obE7os45_&index=2&pp=iAQB
  - TL-DR;
  - epic is kinda like the service level container
    - if your micro-service app has 5 services
    - then you would have 5 epics (sort of)
  - story would then be the business logic of the service
    - e.g. a user service would need to entail registration, login, edit user "business logic"
    - so those would be your story points
  - issues would then be decomposing your story point down to tasks
    - each of these issues would be issued story points to determine the amount of manhours/complexity it requires
    - this then allows for planning manhours over x amt of week
      - e.g. user story has a total of 35 story points
      - if we have 5 developers for 1 weeks(5 days)
      - assuming each dev can clear 2 story points per day 
      - then we should be able to clear 50 story points in 1 week
      - i.e. the feature should be finished within a week

### scrum, sprint, kanban
 - same link as above
   - sprint is the develop->test->review->deploy portion
   - kanban allows the team to track issues over its "lifecycle"
      - e.g. is the issue under todo/in-progress/review/QA/done
   - not too sure what a scrum is.. perhaps the entire process of plan->design->develop->test->deploy->review




### npm vs yarn vs pnpm
- this article https://romanglushach.medium.com/comparing-npm-yarn-and-pnpm-package-managers-which-one-is-right-for-your-distributed-project-to-4d7de2f0db8e
  - TL-DR;
  - pnpm is the newest and fastest but least compatible
    - it's fast because it uses symlinks to global node_modules store
  - yarn is second fastest

  - but you gotta do npm init always


