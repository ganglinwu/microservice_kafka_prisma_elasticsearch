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

### javascript/typescript testing
- jest
  - good for cjs, react apps
  - has been around for quite long
    - many supporting packages
  - a bit slower

- vitest
  - good for esm, ts
  - faster

  - since node 20, there is node:test as well


- instead of full DI, tendency is to mock via Jest's built-in mock/spyOn methods (runtime mocking)

**Runtime Mocking Pros:**
  + Co-location benefit - mocking logic lives with the test, making it easier to understand test intent
  + Self-contained tests are easier to read and maintain
  + Performance - tests run faster (no real dependencies)
  + Deterministic - consistent, controllable test conditions
  + Isolation - pure unit testing, only tests your code

**Runtime Mocking Cons:**
  - False confidence - unit tests pass easily but integration/e2e test will be more difficult
  - Mock drift - mocks can become stale contracts that don't reflect reality
  - Over-mocking syndrome - tendency to mock everything, losing integration value
  - Mock complexity - complex mocks can become harder to maintain than real dependencies
  - Refactoring blindness - changes to interfaces might not break mocked tests
  - Testing strategy issue - harder to catch runtime errors when everything is mocked

**DI Advantages:**
  + Contract enforcement - interfaces ensure real implementations match expectations
  + Refactoring safety - interface changes break tests immediately
  + Hybrid testing - same test can run with mocks or real implementations

**Sweet spot: Layered testing strategy**
  - Runtime mocking for fast unit tests
  - DI for slower integration tests
  - Both approaches serving different purposes 

- crash course on spyOn
  - TL:DR if you wanted to mock a certain method from a certain class
  - first you need to understand mock functions
    - docs https://jestjs.io/docs/mock-function-api
  - mock functions are like ditto of the pokemon world, they can morph into the same signature as the function you want them to mock
    - e.g. const mockFoo = jest.fn<typeof Foo>();
    - now we can insert mockFoo into places that expect a method with Foo signature
  - then they can intercept the calls and do other things you want them to
    - mockFoo.mockImplementation(()=> console.log("bar"))
  - instead of the complex original method with Foo signature, we can get the mock function to morph, intercept and do whatever we want

- so what is spyOn then? 
  - docs https://jestjs.io/docs/jest-object#jestspyonobject-methodname
    - const foo = jest.spyOn(class, "methodname")
      - this creates a mock function object , i.e. foo is type mockFn
      - refer to mock function docs on methods available on mock function objects
    - instead of specifying the function signature, you can tell jest where the method is defined and it will morph for you
    - note that spyOn also tracks cals to the original method, i.e. class.methodname()
      - use foo.mock.calls() to get an array of call arguments made this method
      - or foo.mock.results() to get an array of results made through this method

- so how can we use this in unit testing?
  - suppose we have the following architecture
    - router > service > repository
  - to unit test router functions, we probably need to mock service and repository calls
    - which means we need to establish an interface for service and create a mock instance of it
  - OR you could get jest to spy on the specific method/function we are calling in the service object/class
      - mock it and just get it to return it to us, what it would have returned suppose it had made a trip to the repository

jest mocking PART 2
- so how about jest.mock()
  - usage: jest.mock("path/to/module", mock_implementation_function)
  - simillar to spyOn, jest will intercept calls and carry out the mock implementation function instead.
  - but a slight nuance is that spyOn only changes the specific method you spied on, the other methods remain the same
  - wheras jest.mock replaces __ALL__ exported functions of a module to jest.fn()
- case study: src/repository/__test__/catalog.repository.test
  - since we are writing unit tests on PrismaClient module
  - notice also the expect assertions are also different from spyOn
  - since we did not have specific implementations for the respective jest.fn() 
  - we just monitor the calls made to the functions and their arguments

- supertest
  - TL:DR; it basically is the equivalent of golang's httptest.NewRequest()
  - features
    - Initiating HTTP requests: Supertest allows you to easily simulate HTTP requests such as GET, POST, PUT, DELETE, etc. to test your application’s routing and endpoints.
    - Chained Syntax: Supertest provides a chained syntax that allows you to build and execute multiple requests in a single test case, which helps simulate different user actions in your application.
    - Assertions and Expectations: You can use Supertest in conjunction with assertion libraries such as Chai to examine the content of the response, status codes, headers, etc. to ensure the expected behavior of your application.
    - Authentication Testing: Supertest can be used to test endpoints that require authentication to ensure that user login and authorization functions properly.
    - Asynchronous support: Supertest can handle asynchronous operations, such as waiting for a response to return before executing further test code.
    - Easy Integration: Supertest can be easily used with different Node.js frameworks (e.g. Express, Koa, Hapi, etc.), so you can test all types of applications.




- nullish coalescing operator check on int values!
 - say we are handling an update where the input is partially provided
 - input.stock ?? current.stock will check if input.stock is a null/undefined value, if yes it will go to current.stock
 - which is great because then we can actually update with the number 0, without it failing to go through
   - i.e. consider input.stock || current.stock which will fail to update if input.stock is 0



- dto (data trnasfer object)
 - basically the equivalent of marshall/unmarshall in go (struct tags)
 - but we also put in data validation (go-playground/validator)
 - typically dto is placed in front, if data fails to validate we can notify client early
  - also kind of protects entity use case from dirty data 
