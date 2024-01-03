import abi from '/public/config/abi.json' assert { type: "json" }
import styles from 'styles/containers.module.css'
import Image from 'next/image'
import Loading from 'components/loading'
import ModalConfirmation from './modal_confirmation'
import { parseEther } from 'viem'
import { readContracts } from '@wagmi/core'
import { useForm } from 'react-hook-form'
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from 'wagmi'
import { useState, useEffect } from 'react'

export default function ContainerChangeName(props) {
    const [nameChangeDisabled, setNameChangeDisabled] = useState(false)
    const [inputDisabled, setInputDisabled] = useState(false)
    const [confirmModalDisabled, setConfirmModalDisabled] = useState(true)
    const [inputName, setInputName] = useState('')

    const [ownerMintedAmount, setOwnerMintedAmount] = useState();
    const [ownerTokenId, setOwnerTokenId] = useState();
    const [userPassName, setUserPassName] = useState();

    const mgpContract = {
        address: process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS,
        abi: abi
    };

    const data = async() => {
        return await readContracts({
            contracts: [
                {
                    ...mgpContract,
                    functionName: '_tokenData',
                    args: [props.connectedAddress]
                }
            ]
        });
    }

    data()
    .then((resp) => {
        setOwnerMintedAmount(parseInt(resp[0].result[0]))
        setOwnerTokenId(parseInt(resp[0].result[1]))
    });

    useEffect(() => {
        const data = async() => {
            return await readContracts({
                contracts: [
                    {
                        ...mgpContract,
                        functionName: 'userPassName',
                        args: [ownerTokenId]
                    }
                ]
            });
        }

        data()
        .then((resp) => {
            setUserPassName(resp[0].result);
        });
    }, [ownerTokenId])

    useEffect(() => {
        if(ownerMintedAmount > 0) {
            setNameChangeDisabled(false);
            setInputDisabled(false);
        }
        else {
            setNameChangeDisabled(true);
            setInputDisabled(true);
        }
    }, [ownerMintedAmount]);

    const { config } = usePrepareContractWrite({
        address: process.env.NEXT_PUBLIC_MAINNET_CONTRACT_ADDRESS,
        abi: abi,
        functionName: 'changePassName',
        value: parseEther('0.01'),
        args: [inputName, ownerTokenId]
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
        <div className={styles.block_operate_nfts_name_change}>
            <div>
                <div className={styles.nft_info_area}>
                    <table>
                        <tbody>
                            <tr>
                                <td>パスに刻まれた名前</td>
                                <td>
                                    {userPassName &&
                                        <span>{userPassName}</span>
                                    }
                                    {!userPassName && !ownerMintedAmount &&
                                        <span>パスを保有していません</span>
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td>名前変更価格</td>
                                <td>0.01eth / nameChange</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <form onSubmit={handleSubmit(openModalHandler)}>
                    <div className={styles.text_area}>
                        <input
                            type='text'
                            placeholder='変更後の名前を入力してください'
                            disabled={nameChangeDisabled && inputDisabled}
                            {...register('name', {
                                validate: (data) => {
                                    if(data === '') {
                                        setNameChangeDisabled(true);
                                        setInputDisabled(false);
                                        return '1文字以上の名前を入力してください';
                                    }
                                    if(data.length > 20) {
                                        setNameChangeDisabled(true);
                                        setInputDisabled(false);
                                        return '20文字以内で入力してください';
                                    }
                                    if(data.match('[^a-zA-Z0-9!?#$\\+\\-\\*\\.,_~^@|]+')) {
                                        setNameChangeDisabled(true);
                                        setInputDisabled(false);
                                        return '無効な文字が入力されています';
                                    }
                                    if(data === userPassName) {
                                        setNameChangeDisabled(true);
                                        setInputDisabled(false);
                                        return '現在刻まれている名前と同じ文字が入力されています';
                                    }

                                    setNameChangeDisabled(false);
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
                    {nameChangeDisabled && inputDisabled &&
                        <div className={styles.restrict_msg_area}>
                            {ownerMintedAmount <= 0 &&
                                <div className={styles.title_block}>パスを保有していません</div>
                            }
                        </div>
                    }
                    
                    <div className={styles.submit_area}>
                        {!mintData && !isLoading && !isError &&
                            <input
                                type='submit'
                                value='名前変更'
                                disabled={nameChangeDisabled}
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
                                <p>名前変更に成功しました！</p>
                                <p><a href='https://testnets.opensea.io/ja/account'>マイコレクションを確認する</a></p>
                            </div>
                        }
                        {isError &&
                            <div className={styles.notice_mint_failure}>
                                <p>名前変更に失敗しました。</p>
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