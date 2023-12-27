import abi from '/public/config/abi.json' assert { type: "json" };
import styles from 'styles/containers.module.css'
import Image from 'next/image'
import Loading from 'components/loading'
import ModalConfirmation from 'components/modal_confirmation';
import { parseEther } from 'viem';
import { readContracts } from '@wagmi/core';
import { useForm } from 'react-hook-form'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi';
import { useState, useEffect } from 'react'

export default function ContainerMint(props) {
    const [mintDisabled, setMintDisabled] = useState(false)
    const [inputDisabled, setInputDisabled] = useState(false)
    const [confirmModalDisabled, setConfirmModalDisabled] = useState(true)
    const [inputName, setInputName] = useState('')

    const [totalSupply, setTotalSupply] = useState();
    const [maxSupply, setMaxSupply] = useState();
    const [mintedAmount, setMintedAmount] = useState();
    const [paused, setPaused] = useState(true);

    const mgpContract = {
        address: process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS,
        abi: abi
    };

    const data = async() => {
        return await readContracts({
            contracts: [
                {
                    ...mgpContract,
                    functionName: 'totalSupply'
                },
                {
                    ...mgpContract,
                    functionName: 'maxSupply'
                },
                {
                    ...mgpContract,
                    functionName: 'balanceOf',
                    args: [props.connectedAddress]
                },
                {
                    ...mgpContract,
                    functionName: 'paused'
                }
            ]
        });
    }

    data()
    .then((resp) => {
        setTotalSupply(parseInt(resp[0].result))
        setMaxSupply(parseInt(resp[1].result))
        setMintedAmount(parseInt(resp[2].result))
        setPaused(resp[3].result)
    });

    useEffect(() => {
        if(!paused && mintedAmount <= 0 && totalSupply < maxSupply) {
            setMintDisabled(false);
            setInputDisabled(false);
        }
        else {
            setMintDisabled(true);
            setInputDisabled(true);
        }
    }, [paused]);

    useEffect(() => {
        if(!paused && mintedAmount <= 0 && totalSupply < maxSupply) {
            setMintDisabled(false);
            setInputDisabled(false);
        }
        else {
            setMintDisabled(true);
            setInputDisabled(true);
        }
    }, [mintedAmount]);
    
    useEffect(() => {
        if(!paused && mintedAmount <= 0 && totalSupply < maxSupply) {
            setMintDisabled(false);
            setInputDisabled(false);
        }
        else {
            setMintDisabled(true);
            setInputDisabled(true);
        }
    }, [totalSupply]);

    const { config } = usePrepareContractWrite({
        address: process.env.NEXT_PUBLIC_TESTNET_CONTRACT_ADDRESS,
        abi: abi,
        functionName: 'mint',
        value: parseEther('0.03'),
        args: [inputName]
    });
    const { data: mintData, isSuccess, isError, write } = useContractWrite(config);
    const { isLoading } = useWaitForTransaction({
        hash: mintData?.hash,
    });

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm();

    const openModalHandler = (data) => {
        setInputName(data.name);
        setConfirmModalDisabled(false);
    }

    const confirmModalDisabledHandler = (value) => {
        setConfirmModalDisabled(value);
    }

    const disabledHandler = () => {
        setConfirmModalDisabled(true);
    }

    return (
        <div className={styles.block_operate_nfts_mint}>
            <div>
                <div className={styles.nft_info_area}>
                    <table>
                        <tbody>
                            <tr>
                                <td>ミント数</td>
                                {(totalSupply && maxSupply) &&
                                    <td>[ {totalSupply} / {maxSupply} ]</td>
                                }
                                {(!totalSupply || !maxSupply) &&
                                    <td>
                                        <div className={styles.loading_area}>
                                            <Loading />
                                        </div>
                                    </td>
                                }
                            </tr>
                            <tr>
                                <td>ミント価格</td>
                                <td>0.03eth / mint</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <form onSubmit={handleSubmit(openModalHandler)}>
                    <div className={styles.text_area}>
                        <input
                            type='text'
                            placeholder='パスに刻む名前を入力してください'
                            disabled={mintDisabled && inputDisabled}
                            {...register('name', {
                                validate: (data) => {
                                    if(data === '') {
                                        setMintDisabled(true);
                                        setInputDisabled(false);
                                        return '1文字以上の名前を入力してください';
                                    }
                                    if(data.length > 20) {
                                        setMintDisabled(true);
                                        setInputDisabled(false);
                                        return '20文字以内で入力してください';
                                    }
                                    if(data.match('[^a-zA-Z0-9!?#$\\+\\-\\*\\.,_~^@|]+')) {
                                        setMintDisabled(true);
                                        setInputDisabled(false);
                                        return '無効な文字が入力されています';
                                    }

                                    setMintDisabled(false);
                                    setInputDisabled(false);
                                }
                            })}
                        />
                        
                    </div>
                    
                    {errors.name &&
                        <div className={styles.input_caution_area}>
                            <Image
                                src='/caution.png'
                                width='40'
                                height='30'
                                alt='icon_caution'
                            />
                            <span>{errors.name.message}</span>
                        </div>
                    }
                    
                    
                    {!inputDisabled &&
                        <div className={styles.naming_area}>
                            <div className={styles.title_block}>命名ルール</div>
                            <hr />
                            <div className={styles.description_block}>
                                <p>・半角英数字: 0-9/a-z/A-Z</p>
                                <p>・使える記号: !?#$+-*,._~^@|</p>
                                <p>・最大文字数: 20文字</p>
                                <p>※全角文字(ひらがな/カタカナ/漢字)・上記以外の記号は利用できません</p>
                            </div>
                        </div>
                    }
                    {mintDisabled && inputDisabled &&
                        <div className={styles.restrict_msg_area}>
                            {paused &&
                                <div className={styles.title_block}>管理者制御によりミント操作を制限しています</div>
                            }
                            {!paused && totalSupply >= maxSupply &&
                                <div className={styles.title_block}>完売御礼！</div>
                            }
                            {!paused && totalSupply < maxSupply && mintedAmount > 0 &&
                                <div className={styles.title_block}>ミント数上限に達しています</div>
                            }
                        </div>
                    }
                    
                    <div className={styles.submit_area}>
                        {!mintData && !isLoading && !isError &&
                            <input
                                type='submit'
                                value='ミント'
                                disabled={mintDisabled}
                                onSubmit={handleSubmit(openModalHandler)}
                                className={styles.button_style}
                            />
                        }
                        {isLoading &&
                            <div className={styles.loading_area}>
                                <Loading />
                            </div>
                        }
                        {mintData && !isLoading && !isError && isSuccess &&
                            <div className={styles.notice_mint_success}>
                                <p>ミントに成功しました！</p>
                                <p><a href='https://testnets.opensea.io/ja/account'>マイコレクションを確認する</a></p>
                            </div>
                        }
                        {isError &&
                            <div className={styles.notice_mint_failure}>
                            <p>ミントに失敗しました。</p>
                            <p>ページを更新し、時間を置いて再度ご試行ください。</p>
                        </div>
                        }
                    </div>
                </form>
            </div>

            {!confirmModalDisabled &&
                <ModalConfirmation
                    confirmModalDisabled={confirmModalDisabled}
                    confirmModalDisabledHandler={confirmModalDisabledHandler}
                >
                    <div className={styles.modal_text_block}>
                        <div className={styles.modal_section}>パスに刻む名前 (最終確認)</div>
                        <ul><li>{inputName}</li></ul>
                        <hr />
                        <div className={styles.modal_section}>免責</div>
                        <ul>
                            <li>記載した入力内容にてトランザクションを通した後、再度名前を変更するためには「名前変更」のサービスを仮想通貨の支払いにて実行する必要があります。</li>
                            <li>トランザクションを通す際、入力ミスなどの如何なる理由があった場合においても、保証・返金対応の実施は致しません。</li>
                            <li>残高不足・ガス代変動などのあらゆる原因によるトランザクション失敗に対する保障は致しません。</li>
                            <li>サービス利用料 (仮想通貨) の価格は予告なく変更する場合がございます。</li>
                        </ul>
                        <hr />
                        <p>※入力した名前に相違なく、免責に同意する場合は「はい」をクリックしてください。</p>
                        <div className={styles.submit_area}>
                            <button
                                className={styles.no_button}
                                onClick={disabledHandler}
                            >
                                いいえ
                            </button>
                            <button
                                className={styles.button_style}
                                disabled={!write || isSuccess}
                                onClick={() => {
                                    disabledHandler()
                                    write?.()
                                }}
                            >
                                はい
                            </button>
                        </div>
                        
                    </div>
                </ModalConfirmation>
            }
        </div>
    )
}