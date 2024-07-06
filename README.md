# Redis Search and SQL Query Comparisons  

## Contents
1.  [Summary](#summary)
2.  [Features](#features)
3.  [Prerequisites](#prerequisites)
4.  [Installation](#installation)
5.  [Usage](#usage)

## Summary <a name="summary"></a>
This is a series of comparisons of equivalent SQL and Redis Search commands against the Chinook dataset.  Oracle Enterprise (OE) is used as the relational database with Redis Data Integration (RDI) used to populate a Redis Enterprise (RE) database via Change Data Capture (CDC.)

## Features <a name="features"></a>
- Builds out a full RE with RDI and OE environment to include:  1-node RE Cluster, 1-node OE, and RDI.

## Prerequisites <a name="prerequisites"></a>
- Ubuntu 20.x
- Docker Compose
- Docker
- python3
- java
- nodejs
- .net
- Oracle container registry credentials

## Installation <a name="installation"></a>
```bash
git clone https://github.com/redis-developer/search-sql.git && cd search-sql
```

## Usage <a name="usage"></a>
### Docker Containers Start-up
```bash
./start.sh
```
### Docker Containers Stop
```bash
./stop.sh
```