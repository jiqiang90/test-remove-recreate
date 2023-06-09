import {
  SubstrateExtrinsic,
  SubstrateEvent,
  SubstrateBlock,
} from "@subql/types";
import { StarterEntity } from "../types";
import { Balance } from "@polkadot/types/interfaces";

export async function handleBlock(block: SubstrateBlock): Promise<void> {
  if(block.block.header.number.toNumber() > 1000){
    return
  }
  //Create a new starterEntity with ID using block hash
  let record = new StarterEntity(block.block.header.hash.toString());
  //Record block number
  record.field1 = block.block.header.number.toNumber();
    await record.save();

}


export async function handleBlockUpdate(block: SubstrateBlock): Promise<void> {

  if(block.block.header.number.toNumber() === 1000){
    logger.info(`=======================================`)
    const allEntities = await store.getByField('StarterEntity','field5',1,{limit:2000}) as StarterEntity[]
    await Promise.all(allEntities.map(e=>{
      StarterEntity.remove(e.id)
    }))
    logger.info(`removed ${allEntities.length} entities, at block ${block.block.header.number.toNumber()}`)
    const filteredEntities = allEntities.filter(e=> e.field1 <= 970 && e.field1 > 20 ).sort((a, b) => a.field1-b.field1)
    logger.info(`Recreate entity [${filteredEntities[0].field1}-${filteredEntities[filteredEntities.length-1].field1}]`)
    const updated = filteredEntities.map(e=>{
      (e as StarterEntity).field5 = 2
      return e
    })
    await store.bulkCreate('StarterEntity',updated)
    logger.info(`Recreated ${filteredEntities.length} entities`)
    logger.info(`=======================================`)
  }
}


export async function handleEvent(event: SubstrateEvent): Promise<void> {

  if(event.block.block.header.number.toNumber() > 1000){
    return
  }
  const {
    event: {
      data: [account, balance],
    },
  } = event;
  //Retrieve the record by its ID
  const record = await StarterEntity.get(
      event.block.block.header.hash.toString()
  );
  record.field2 = account.toString();
  //Big integer type Balance of a transfer event
  record.field3 = (balance as Balance).toBigInt();

  await record.save();

}

export async function handleCall(extrinsic: SubstrateExtrinsic): Promise<void> {
  if(extrinsic.block.block.header.number.toNumber() > 1000){
    return
  }
  const record = await StarterEntity.get(
      extrinsic.block.block.header.hash.toString()
  );
  //Date type timestamp
  record.field4 = extrinsic.block.timestamp;
  //Boolean tyep
  record.field5 = 1;
  await record.save();
}
