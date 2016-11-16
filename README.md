
```
   ____                        _             _
  |  _ \ _   _ _ __ ___  _ __ (_)_ __   __ _| |_ ___  _ __
  | | | | | | | '_ ` _ \| '_ \| | '_ \ / _` | __/ _ \| '__|
  | |_| | |_| | | | | | | |_) | | | | | (_| | || (_) | |
  |____/ \__,_|_| |_| |_| .__/|_|_| |_|\__,_|\__\___/|_|
                        |_|
```


Dumpinator is an automated QA tool for REST APIs. Its mission is to compare a list of HTTP Response Headers & Bodies in different environments & versions. The current version was developed as a development tool that quickly generates API response diffs that give an idea whether major refactorings work as expected. The goal is to develop Dumpinator as an independent, scriptable CLI tool that can be used for all sorts of REST APIs. It expects a main configuration file and spec files for each API endpoint that needs to be diff'ed. Each run writes the responses as JSON files in the given directory and outputs an easy-to-read HTML report of the diff. Used in combination with Jenkins, Dumpinator can be run in a CI pipeline but also be triggered manually by the QA team each time a new API release is about to be deployed as a replacement for tedious and time consuming regression tests.

> "With Dumpinator™, we are about to revolutionize the way we think about Heimdall testing and API testing in general."

_A. Heinkelein, CEO Heimdall Inc._
