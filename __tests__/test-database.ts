import { MockDatabase } from "types";

export const firestoreFakeDatabase: MockDatabase = {
  collection_test: {
    docs: [
      {
        id: "doc_1",
        data: {
          foo: "bar"
        },
        subcollections: {
          sub_collection_1: {
            docs: [
              {
                id: "doc_1_1",
                data: {
                  foo: "baz"
                },
                subcollections: {
                  sub_collection_1_1: {
                    docs: [
                      {
                        id: "doc_1_1_1",
                        data: {
                          text: "super deep nested doc"
                        }
                      }
                    ]
                  }
                }
              },
              {
                id: "doc_1_2",
                data: {
                  baz: "foo"
                }
              }
            ]
          }
        }
      },
      {
        id: "doc_2",
        data: {
          foo: "bar",
          random: "data"
        },
        subcollections: {}
      }
    ]
  },
  restaurant_test: {
    docs: [
      {
        id: "OnmVZDckv7WtnAUxUf93",
        data: {
          id: "OnmVZDckv7WtnAUxUf93",
          rate: 3.9,
          restaurant_name: "The Tropical Apple",
          categories: ["Barbeque", "Breakfast", "Buffets"],
          address: "Ecuador Street",
          manager: {
            name: "Benton Buckridge",
            email: "benton.buckridge@email.com"
          }
        }
      },
      {
        id: "NtllENPpBJ5axDTQ5HvQ",
        data: {
          id: "NtllENPpBJ5axDTQ5HvQ",
          rate: 4.5,
          restaurant_name: "Intermezzo",
          categories: ["Italian", "Buffets"],
          address: "Italian Street",
          manager: {
            name: "Damian Donnelly",
            email: "damian.donnelly@email.com"
          }
        }
      },
      {
        id: "Qil2nlsVIS4QO3vrvBUJ",
        data: {
          id: "Qil2nlsVIS4QO3vrvBUJ",
          rate: 4.7,
          restaurant_name: "Tokyo Asian Express",
          categories: ["Asian", "Sushi", "Japonese"],
          address: "Japan Street",
          manager: {
            name: "Burdette Mante",
            email: "burdette.mante@email.com"
          }
        }
      },
      {
        id: "X5f0Sc74drmX4JvgxY23",
        data: {
          id: "X5f0Sc74drmX4JvgxY23",
          rate: 4.0,
          restaurant_name: "Tend Grill",
          categories: ["Barbeque"],
          address: "Brazil Street",
          manager: {
            name: "Angelina Swaniawski",
            email: "angelina.swaniawski@email.com"
          }
        }
      },
      {
        id: "94baX00vsAc31iaOutwi",
        data: {
          id: "94baX00vsAc31iaOutwi",
          rate: 4.9,
          restaurant_name: "Neko Cafe",
          categories: ["Cafe", "Asian", "Japonese"],
          address: "Japan Street",
          manager: {
            name: "Chocola Vanilla",
            email: "chocola.vanilla@email.com"
          }
        }
      },
      {
        id: "aQeavSXvnjqpJOjPKGij",
        data: {
          id: "aQeavSXvnjqpJOjPKGij",
          rate: 4.7,
          restaurant_name: "Net Worthy",
          categories: ["Cafe"],
          address: "South Korea Street",
          manager: {
            name: "Chun-Li",
            email: "chun.li.hee@email.com"
          }
        }
      }
    ]
  }
};
