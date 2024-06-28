# Redis Search and SQL Query Comparisons  

## Contents
1.  [Summary](#summary)
2.  [Architecture](#architecture)
3.  [Data Set in Redis Insight](#dataset)
4.  [Features](#features)
5.  [Prerequisites](#prerequisites)
6.  [Installation](#installation)
7.  [Usage](#usage)
8.  [Scenario 1](#scenario1)
9.  [Scenario 2](#scenario2)
10. [Scenario 3](#scenario3)
11. [Scenario 4](#scenario4)
12. [Scenario 5](#scenario5)
13. [Scenario 6](#scenario6)
14. [Scenario 7](#scenario7)
15. [Scenario 8](#scenario8)

## Summary <a name="summary"></a>
This is a series of comparisons of equivalent SQL and Redis Search commands against the Chinook dataset.  Oracle Enterprise (OE) is used as the relational database with Redis Data Integration (RDI) used to populate a Redis Enterprise (RE) database via Change Data Capture (CDC.)

## Architecture <a name="architecture"></a>
![architecture]

## Redis Enterprise Config <a name="rladmin"></a>
![rladmin]

## Data Set In RedisInsight <a name="dataset"></a>
![dataset]

## Features <a name="features"></a>
- Builds out a full RE with RDI and OE environment to include:  3-node RE Cluster, 1-node OE, RDI, and Debezium.

## Prerequisites <a name="prerequisites"></a>
- Ubuntu 20.x
- Docker Compose
- Docker
- 

## Installation <a name="installation"></a>
```bash
git clone https://github.com/redis-developer/search-sql.git && cd search-sql && npm install
```

## Usage <a name="usage"></a>
### Start
```bash
./start.sh
```
### Stop
```bash
./stop.sh
```