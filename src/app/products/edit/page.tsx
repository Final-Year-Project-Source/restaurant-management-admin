'use client';
import Dropdown from '@/components/dropdown/Dropdown';
import { GetProp, message, Skeleton, Upload, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useEffect, useMemo, useRef, useState } from 'react';
import '../product.scss';

import Button from '@/components/adminPage/Button';
import InputText from '@/components/adminPage/Input';
import { ArrowLeftIcon1 } from '@/components/Icons';
import CustomizedSwitch from '@/components/switch';
import { useScrollbarState } from '@/hooks/useScrollbarState';
import { useWindowDimensions } from '@/hooks/useWindowDimensions';
import { useGetCategoriesQuery } from '@/redux/services/categoryApi';
import { useGetGroupsQuery } from '@/redux/services/groupApi';
import { useGetModifiersQuery } from '@/redux/services/modifierApi';
import {
  useDeleteImageProductMutation,
  useDeleteProductMutation,
  useGetSingleProductQuery,
  useUpdateProductMutation,
  useUploadImageMutation,
} from '@/redux/services/productApi';
import {
  convertCategoriesToOptions,
  convertGroupsToOptions,
  convertModifiersToOptions,
  DIETARY_RESTRICTIONS,
  FOOTER_HEIGHT_SAVE,
  getLabelById,
  HEADER_LAYOUT,
  PADDING_TOP_TO_SCROLL,
  PROTEINS,
} from '@/utils/constants';
import { useFormik } from 'formik';
import { isEqual } from 'lodash';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import TextAreaInput from '@/components/input/TextArea';
import CustomizedDrawer from '@/components/drawer';
import CustomizedModal from '@/components/modal';

const schema = Yup.object().shape({
  name: Yup.string().required('Missing Product'),
  price: Yup.number()
    .required('Missing Price')
    .typeError('Price must be a number')
    .positive('Price must be a positive number'),
});

type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0];

const AddProduct = () => {
  const router = useRouter();
  const { isMobile, width: screenWidth, height } = useWindowDimensions();
  const bodyRef = useRef<HTMLDivElement>(null);
  const { scrollBottom } = useScrollbarState(bodyRef);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [isChangedImage, setIsChangedImage] = useState(false);

  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const { data: singleProduct, isLoading } = useGetSingleProductQuery({ id: id || '' }, { skip: !id });
  const [updateProduct, { isLoading: isUpdateLoading }] = useUpdateProductMutation();
  const [uploadImage, { isLoading: isImageLoading }] = useUploadImageMutation();
  const { data: allModifiers, isLoading: isModifierLoading } = useGetModifiersQuery({ search: '' });
  const MODIFIERS = convertModifiersToOptions(allModifiers?.data);
  const { data: allCategories, isLoading: isCategoryLoading } = useGetCategoriesQuery();
  const CATEGORIES = convertCategoriesToOptions(allCategories?.data, 'id');
  const { data: groupsData, isLoading: isGroupsLoading } = useGetGroupsQuery();
  const GROUPS = convertGroupsToOptions(groupsData?.data, 'id');
  const [deleteProduct, { isLoading: isDeleteLoading }] = useDeleteProductMutation();
  const [deleteImageProduct, { isLoading: isDeleteImageLoading }] = useDeleteImageProductMutation();

  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);

  const product = singleProduct?.data;

  useEffect(() => {
    product?.image_url
      ? setFileList([
          {
            uid: '-1',
            name: 'defaultImage.png',
            status: 'done',
            url: product?.image_url,
          },
        ])
      : setFileList([]);
    resetForm({
      values: {
        ...product,
      },
    });
  }, [product]);

  const formik = useFormik({
    initialValues: {
      name: product?.name || '',
      description: product?.description || '',
      category_id: product?._id || '',
      group_id: product?.group_id || '',
      track_inventory: product?.track_inventory || true,
      proteins: product?.proteins || [],
      dietary_restrictions: product?.dietary_restrictions || [],
      price: product?.price || null,
      in_stock: product?.in_stock || null,
      low_stock: product?.low_stock || null,
      modifier_ids: product?.modifier_ids || [],
    },
    validationSchema: schema,
    onSubmit: async (values) => {
      const data = {
        name: values.name.trim(),
        category_id: values?.category_id,
        proteins: Array.isArray(values?.proteins) ? values?.proteins : [],
        group_id: values?.group_id,
        dietary_restrictions: Array.isArray(values?.dietary_restrictions) ? values?.dietary_restrictions : [],
        price: Number(values?.price),
        in_stock: Number(values?.in_stock),
        low_stock: Number(values?.low_stock),
        track_inventory: values?.track_inventory,
        modifier_ids: Array.isArray(values?.modifier_ids) ? values?.modifier_ids : [],
        description: values?.description.trim(),
        id: id || '',
      };

      updateProduct({
        data: data,
      })
        .unwrap()
        .then((response) => {
          if (response && response.data) {
            if (fileList[0] && fileList[0].originFileObj) {
              uploadImage({
                id: response.data._id,
                image_file: fileList[0].originFileObj as File,
              });
            } else if (isChangedImage) {
              deleteImageProduct({
                id: response.data._id,
              });
              setFileList([]);
            }
          }
          router.push(`/products`);
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });

  const { errors, touched, values, handleChange, handleSubmit, resetForm } = formik;

  const validateProductField = useMemo(() => {
    return {
      ...product,
      description: product?.description?.trim(),
      name: product?.name?.trim(),
      price: Number(product?.price),
      in_stock: Number(product?.in_stock),
      low_stock: Number(product?.low_stock),
    };
  }, [product]);

  const validateValuesField = useMemo(() => {
    return {
      ...values,
      description: values?.description?.trim(),
      name: values?.name?.trim(),
      price: Number(values?.price),
      in_stock: Number(values?.in_stock),
      low_stock: Number(values?.low_stock),
    };
  }, [values]);

  const isDisabled = useMemo(() => {
    const isDataEqual = isEqual(validateProductField, validateValuesField) && !isChangedImage;

    return (
      Object.keys(errors).length > 0 ||
      isDataEqual ||
      isUpdateLoading ||
      isCategoryLoading ||
      isGroupsLoading ||
      isImageLoading ||
      isModifierLoading ||
      !values.name ||
      !values.price ||
      (values.in_stock && isNaN(values.in_stock)) ||
      (values.low_stock && isNaN(values.low_stock))
    );
  }, [
    errors,
    isUpdateLoading,
    isCategoryLoading,
    isGroupsLoading,
    isImageLoading,
    isModifierLoading,
    values,
    fileList,
    isChangedImage,
  ]);

  const onChange: UploadProps['onChange'] = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);
    setIsChangedImage(true);
    if (info.file.status === 'done') {
    } else if (info.file.status === 'error') {
      const errorMessage = info.file.response ? info.file.response.error : 'Unknown error';

      message.error(errorMessage);
    }
  };

  const onPreview = async (file: UploadFile) => {
    let src = file.url as string;
    if (!src) {
      try {
        src = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file.originFileObj as FileType);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (error) => {
            reject('Lỗi tải ảnh');
          };
        });
      } catch (error) {}
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  const handleOkDelete = () => {
    deleteProduct({ id: id || '' })
      .unwrap()
      .then((response) => {
        setIsModalDeleteOpen(false);
        router.push('/products');
      })
      .catch((error) => toast.error(error.data.message));
    setIsModalDeleteOpen(false);
  };

  return (
    <main
      className="edit-product-customized md:relative overflow-y-auto"
      ref={bodyRef}
      style={{ height: height - (isMobile ? FOOTER_HEIGHT_SAVE + HEADER_LAYOUT : 0) }}
    >
      <form
        className="flex flex-col bg-white md:pt-6 md:pb-[25px] md:px-[25px] px-5 max-md:pt-5 max-md:pb-[10px] rounded-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between md:mr-[156px]">
          <Button
            className="w-[142px] mr-2"
            variant="primary"
            icon={<ArrowLeftIcon1 />}
            onClick={() => router.back()}
            disabled={
              isUpdateLoading ||
              isLoading ||
              isCategoryLoading ||
              isGroupsLoading ||
              isImageLoading ||
              isModifierLoading ||
              isDeleteLoading ||
              isDeleteImageLoading
            }
            type="button"
          >
            Trở lại
          </Button>
          <Button
            type="button"
            className="w-[136px]"
            onClick={() => setIsModalDeleteOpen(true)}
            disabled={
              isUpdateLoading ||
              isLoading ||
              isCategoryLoading ||
              isGroupsLoading ||
              isImageLoading ||
              isModifierLoading ||
              isDeleteLoading ||
              isDeleteImageLoading
            }
          >
            Xoá
          </Button>
        </div>

        <div
          className={`z-10 md:h-[50px] h-[101px] max-md:px-[20px] absolute md:top-[25px] md:right-[25px] right-1/2 max-md:transform max-md:translate-x-1/2 bottom-0 md:min-w-[136px] w-full md:w-auto max-md:py-5 max-md:bg-white ${
            scrollBottom > PADDING_TOP_TO_SCROLL && isMobile ? 'shadow-medium-top' : ''
          }`}
        >
          <Button
            className={'w-full max-md:!max-h-[61px] h-[61px]'}
            variant="secondary"
            type="submit"
            disabled={isDisabled}
          >
            Lưu
          </Button>
        </div>

        <div className="flex max-lg:flex-col md:py-[25px] pt-[30px]">
          <div className="lg:w-1/2 lg:mr-[56px] grid lg:grid-cols-7 md:grid-cols-4 grid-cols-1 space-y-[10px]">
            <label className="font-medium lg:col-span-2 md:pt-5">Tên món ăn</label>

            <div className="lg:col-span-5">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <div>
                  <InputText
                    disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                    id="name"
                    placeholder="Tên món ăn"
                    value={values.name}
                    onChange={handleChange}
                  />
                  {errors.name && touched.name && typeof errors.name === 'string' && (
                    <span className="text-[12px] text-red-500">{errors.name}</span>
                  )}
                </div>
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Mô tả</label>
            <div className="lg:col-span-5">
              {isLoading ? (
                <Skeleton.Button active block style={{ height: 85 }} />
              ) : (
                <TextAreaInput
                  disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                  id="description"
                  placeholder="Mô tả"
                  value={values.description}
                  onChange={(e) => handleChange({ target: { id: 'description', value: e.target.value } })}
                />
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px]">Giá</label>
            <div className="lg:col-span-5 max-w-[172px]">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <div>
                  <InputText
                    disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                    id="price"
                    placeholder="Giá"
                    value={values?.price || ''}
                    onChange={handleChange}
                  />
                  {errors.price && touched.price && typeof errors.price === 'string' && (
                    <span className="text-[12px] text-red-500">{errors.price}</span>
                  )}
                </div>
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Danh mục</label>
            <div className="lg:col-span-5">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <Dropdown
                  disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                  id="category_id"
                  placeholder="Chọn danh mục"
                  options={CATEGORIES}
                  loading={isCategoryLoading}
                  labelItem={getLabelById(values.category_id, CATEGORIES)}
                  value={values.category_id}
                  onChange={(value) => handleChange({ target: { id: 'category_id', value } })}
                />
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px]">Nhóm</label>
            <div className="lg:col-span-5">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <Dropdown
                  disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                  id="group_id"
                  placeholder="Chọn nhóm"
                  options={GROUPS}
                  loading={isGroupsLoading}
                  labelItem={getLabelById(values.group_id, GROUPS)}
                  value={values.group_id}
                  onChange={(value) => handleChange({ target: { id: 'group_id', value } })}
                />
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Protein</label>
            <div className="lg:col-span-5">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <Dropdown
                  disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                  id="proteins"
                  mode="multiple"
                  placeholder="Chọn proteins"
                  options={PROTEINS}
                  labelItem={getLabelById(values.proteins, PROTEINS)?.join(', ')}
                  value={values.proteins}
                  onChange={(value) => handleChange({ target: { id: 'proteins', value } })}
                />
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px]">Chế độ ăn kiêng</label>
            <div className="lg:col-span-5">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <Dropdown
                  disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                  id="dietary_restrictions"
                  fontSizeDropdown={13}
                  mode="multiple"
                  placeholder="Chọn chế độ ăn kiêng"
                  labelItem={getLabelById(values.dietary_restrictions, DIETARY_RESTRICTIONS)?.join(', ')}
                  options={DIETARY_RESTRICTIONS}
                  value={values.dietary_restrictions}
                  onChange={(value) => handleChange({ target: { id: 'dietary_restrictions', value } })}
                />
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Lựa chọn</label>
            <div className="lg:col-span-5">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <Dropdown
                  disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                  id="modifier_ids"
                  mode="multiple"
                  placeholder="Chọn lựa chọn"
                  options={MODIFIERS}
                  loading={isModifierLoading}
                  labelItem={getLabelById(values.modifier_ids, MODIFIERS)?.join(', ')}
                  value={values.modifier_ids}
                  onChange={(value) => handleChange({ target: { id: 'modifier_ids', value } })}
                />
              )}
            </div>

            <label className="font-medium lg:col-span-2">Theo dõi hàng tồn kho</label>
            <div className="lg:col-span-5 flex-col space-y-[10px]">
              {isLoading ? (
                <Skeleton.Button active block />
              ) : (
                <CustomizedSwitch
                  disabled={isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading}
                  id="track_inventory"
                  onChange={(value) => handleChange({ target: { id: 'track_inventory', value } })}
                  checked={values.track_inventory}
                />
              )}
              {values.track_inventory && (
                <div className="flex space-x-[10px]">
                  <div className="w-[102px]">
                    {isLoading ? (
                      <Skeleton.Button active block />
                    ) : (
                      <InputText
                        disabled={
                          isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading
                        }
                        id="in_stock"
                        placeholder="Còn hàng"
                        value={values?.in_stock || null}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                  <div className="w-[102px]">
                    {isLoading ? (
                      <Skeleton.Button active block />
                    ) : (
                      <InputText
                        disabled={
                          isLoading || isDeleteLoading || isUpdateLoading || isImageLoading || isDeleteImageLoading
                        }
                        id="low_stock"
                        placeholder="Thiếu hàng"
                        value={values?.low_stock || null}
                        onChange={handleChange}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col space-y-[10px] max-lg:pt-5">
            <span className="font-medium">Ảnh</span>
            <div className="flex flex-col h-[300px] w-[300px]">
              {isLoading ? (
                <Skeleton.Image active />
              ) : (
                <ImgCrop rotationSlider fillColor="transparent">
                  <Upload
                    listType="picture-card"
                    fileList={fileList}
                    onChange={onChange}
                    onPreview={onPreview}
                    name="image_url"
                  >
                    {fileList.length < 1 && '+ Tải ảnh lên'}
                  </Upload>
                </ImgCrop>
              )}
            </div>
            <div className="pt-[10px] text-[11px] font-open-sans">
              <span>Yêu cầu về hình ảnh: </span>
              <ul className="list-disc pl-5">
                <li>Tối thiểu 1024 x 1024 pixel </li>
                <li>.png có nền trong suốt</li>
              </ul>
            </div>
          </div>
        </div>
        {isModalDeleteOpen && (
          <>
            <CustomizedModal
              className="modifier-modal-customized"
              open={isModalDeleteOpen && !isMobile}
              title="Confirm deletion"
              onOk={handleOkDelete}
              okText="Delete"
              onCancel={() => setIsModalDeleteOpen(false)}
            >
              <div className="text-center text-black-400 flex flex-col mb-[30px]">
                <span>Bạn có chắc muốn xoá?</span> <span>Điều này không thể được hoàn tác.</span>
              </div>
            </CustomizedModal>
            <CustomizedDrawer
              className="bill-drawer"
              type="confirm"
              open={isModalDeleteOpen && isMobile}
              onClose={() => setIsModalDeleteOpen(false)}
              title="Confirm deletion"
              okText="Delete"
              onOk={handleOkDelete}
              width={screenWidth}
            >
              <div className="text-center text-black-400 flex flex-col">
                <span>Bạn có chắc muốn xoá?</span> <span>Điều này không thể được hoàn tác.</span>
              </div>
            </CustomizedDrawer>
          </>
        )}
      </form>
    </main>
  );
};
export default AddProduct;
