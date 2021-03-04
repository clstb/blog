---
title: Managing data models in Go
author: Claas Störtenbecker
date: 2021-03-04
hero: ./images/hero.jpg
excerpt: How I avoid duplicating data structures in Go services.
---

Once upon a time a developer created a new Go service.
He started by defining the service interface as protobuf spec, generated code, and saw it was good.
The need to store data creeped up to him. Being a smart hackernews reader he chooses [sqlc](https://github.com/kyleconroy/sqlc) to generate CRUD and model code from sql.
Then the product owner reached out to implement new business logic.
Striving for a clean code base the developer creates a new data structure once again, adding methods to the new struct.
After awhile inconsistency in the code base started to show.  

> In how many places does code break if we touch files code is generated from? Many.

Let's make some observations.
1. The database schema is most likely the root of the datamodel.
2. Protocol buffers exist mainly to define an interface, used for GRPC communication.
3. Business logic doesn't have to be a method of a struct, though it makes sense in many cases.

The goal should be to have a single struct for each data model which is used throughout the entire codebase. To achieve this we make use of struct embedding and methods that handle transcoding.

```go
// generated

// /pkg/pb/account.pb.go

type Account struct {
    state         protoimpl.MessageState
    sizeCache     protoimpl.SizeCache
    unknownFields protoimpl.UnknownFields

    Id   string `protobuf:"bytes,1,opt,name=id,proto3" json:"id,omitempty"`
    Name string `protobuf:"bytes,2,opt,name=name,proto3" json:"name,omitempty"`
}
```

```go
// generated

// /pkg/db/model.go

type Account struct {
    ID   uuid.UUID `json:"id"`
    Name string    `json:"name"`
}
```

```go
// /pkg/business/account.go

import "pkg/db"
import "pkg/pb"

type Account struct {
    db.Account
} 
 
// This is pretty straight forward.
// Generated query functions will return a db.Account and we can transcode swiftly.
// Nothing can break here.
func AccountFromDB(a db.Account) Account {
	return Account{Account: a}
}

// Arguably the most complicated function.
// We need to transcode a protobuf struct to our business logic struct.
// Writing a generator for std data types shouldn't be to complicated.
// How to extend it to custom types needs some thought.
func AccountFromPB(a *pb.Account) (Account, error) {
    id, err := uuid.FromStringOrNil(a.Id)
    if err != nil {
        return Account{}, err
    }

	account := Account{}
	account.ID = id
	account.Name = a.Name

	return account, nil
}

// This is pretty simple again and could easily be generated.
func (a Account) PB() *pb.Account {
	return &pb.Account{
		Id:   a.ID.String(),
		Name: a.Name,
	}
}
```

When investing the effort to write robust generators one time, maintenance headache in the code base is reduced significantly.
Mentioned generator could even be used universally over services.