import { BigNumber } from 'ethers'

interface TestCase {
    staked: BigNumber,
    target: BigNumber,
    apr: BigNumber,
}

const cases = [
    {
        staked: '10000000000000000000000000', //10M API3
        target: '10000000000000000000000000', //10M API3
        apr: '3000000', //3%
    },
    {
        staked: '6000000000000000000000000', //6M
        target: '10000000000000000000000000', //10M
        apr: '15000000', //15%
    },
    {
        staked: '1000000000000000000000000', //1M
        target: '1000000000000000000000000', //1M
        apr: '2500000', //2.5%
    },
    {
        staked: '540000000000000000000000', //540k
        target: '180000000000000000000000', //180k
        apr: '35000000', //35%
    },
    {// stake < target, % = max
        staked: '100000000000000000000000', //100k
        target: '10000000000000000000000000', //10M
        apr: '75000000', //75%,
    },
    {// stake < target, min < % < max
        staked: '100000000000000000000000', //100k
        target: '1000000000000000000000000', //1M
        apr: '50000000' //50%
    },
    {// stake > target, min < % < max
        staked: '1000000000000000000000000', //1M
        target: '100000000000000000000000', //100k
        apr: '25000000' //25%
    }
]

export const testCases: TestCase[] =
    cases.map((val) => {
        return {
            staked: BigNumber.from(val.staked),
            apr: BigNumber.from(val.apr),
            target: BigNumber.from(val.target)
        }
    })