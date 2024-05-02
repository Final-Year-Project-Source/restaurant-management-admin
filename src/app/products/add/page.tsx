'use client';
import Dropdown from '@/components/dropdown/Dropdown';
import { GetProp, message, Upload, UploadFile, UploadProps } from 'antd';
import ImgCrop from 'antd-img-crop';
import { useMemo, useRef, useState } from 'react';
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
import { useAddProductMutation, useUploadImageMutation } from '@/redux/services/productApi';
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
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import TextAreaInput from '@/components/adminPage/TextArea';
import { useSession } from 'next-auth/react';

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
  const { data: session } = useSession();
  const { scrollBottom } = useScrollbarState(bodyRef);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [addProduct, { isLoading: isAddLoading }] = useAddProductMutation();
  const [uploadImage, { isLoading: isImageLoading }] = useUploadImageMutation();
  const { data: allModifiers, isLoading: isModifierLoading } = useGetModifiersQuery({ search: '' });
  const MODIFIERS = convertModifiersToOptions(allModifiers?.data);
  const { data: allCategories, isLoading: isCategoryLoading } = useGetCategoriesQuery();
  const CATEGORIES = convertCategoriesToOptions(allCategories?.data, 'id');
  const { data: groupsData, isLoading: isGroupsLoading } = useGetGroupsQuery();
  const GROUPS = convertGroupsToOptions(groupsData?.data, 'id');

  if (session?.user?.role === 'Standard') {
    toast.error('You are not authorized to access this page.');
    router.push('/products');
  }

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      category_id: '',
      group_id: '',
      track_inventory: true,
      proteins: [],
      dietary_restrictions: [],
      price: null,
      in_stock: null,
      low_stock: null,
      modifier_ids: [],
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
      };

      addProduct({
        data: data,
      })
        .unwrap()
        .then((response) => {
          if (fileList[0]?.originFileObj) {
            uploadImage({
              id: response.data?._id,
              image_file: fileList[0].originFileObj as File,
            });
          }
          router.push(`/products`);
        })
        .catch((error) => toast.error(error?.data?.message));
    },
  });

  const { errors, touched, values, handleChange, handleSubmit, resetForm } = formik;

  const isDisabled = useMemo(() => {
    return (
      Object.keys(errors).length > 0 ||
      isAddLoading ||
      isCategoryLoading ||
      isGroupsLoading ||
      isImageLoading ||
      isModifierLoading ||
      !values.name ||
      !values.price ||
      (values.in_stock && isNaN(values.in_stock)) ||
      (values.low_stock && isNaN(values.low_stock))
    );
  }, [errors, isAddLoading, isCategoryLoading, isGroupsLoading, isImageLoading, isModifierLoading, values]);

  const onChange: UploadProps['onChange'] = (info) => {
    const { fileList: newFileList } = info;
    setFileList(newFileList);
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
            reject('Error loading image');
          };
        });
      } catch (error) {}
    }
    const image = new Image();
    image.src = src;
    const imgWindow = window.open(src);
    imgWindow?.document.write(image.outerHTML);
  };

  return (
    <main
      className="add-product-customized md:relative overflow-y-auto"
      ref={bodyRef}
      style={{ height: height - (isMobile ? FOOTER_HEIGHT_SAVE + HEADER_LAYOUT : 0) }}
    >
      <form
        className="flex flex-col bg-white md:pt-6 md:pb-[25px] md:px-[25px] px-5 max-md:pt-5 max-md:pb-[10px] rounded-xl"
        onSubmit={handleSubmit}
      >
        <div className="flex items-center justify-between md:mr-[156px]">
          <Button
            className="w-[142px]"
            variant="primary"
            icon={<ArrowLeftIcon1 />}
            onClick={() => router.back()}
            disabled={isAddLoading || isCategoryLoading || isGroupsLoading || isImageLoading || isModifierLoading}
            type="button"
          >
            Back
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
            Save
          </Button>
        </div>
        <div className="flex max-lg:flex-col md:py-[25px] pt-[30px]">
          <div className="lg:w-1/2 lg:mr-[56px] grid lg:grid-cols-7 md:grid-cols-4 grid-cols-1 space-y-[10px]">
            <label className="font-medium lg:col-span-2 md:pt-5">Product name</label>

            <div className="lg:col-span-5">
              <div>
                <InputText
                  disabled={isAddLoading}
                  id="name"
                  placeholder="Product name"
                  value={values.name}
                  onChange={handleChange}
                />
                {errors.name && touched.name && typeof errors.name === 'string' && (
                  <span className="text-[12px] text-red-500">{errors.name}</span>
                )}
              </div>
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Description</label>
            <div className="lg:col-span-5">
              <TextAreaInput
                disabled={isAddLoading}
                id="description"
                placeholder="Description"
                value={values.description}
                onChange={(e) => handleChange({ target: { id: 'description', value: e.target.value } })}
              />
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px]">Price</label>
            <div className="lg:col-span-5 max-w-[172px]">
              <InputText
                disabled={isAddLoading}
                id="price"
                placeholder="Price"
                value={values?.price || ''}
                onChange={handleChange}
              />
              {errors.price && touched.price && typeof errors.price === 'string' && (
                <span className="text-[12px] text-red-500">{errors.price}</span>
              )}
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Menu category</label>
            <div className="lg:col-span-5">
              <Dropdown
                disabled={isAddLoading}
                id="category_id"
                placeholder="Select category"
                options={CATEGORIES}
                loading={isCategoryLoading}
                labelItem={getLabelById(values.category_id, CATEGORIES)}
                value={values.category_id}
                onChange={(value) => handleChange({ target: { id: 'category_id', value } })}
              />
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px]">Group</label>
            <div className="lg:col-span-5">
              <Dropdown
                disabled={isAddLoading}
                id="group_id"
                placeholder="Select group"
                options={GROUPS}
                loading={isGroupsLoading}
                labelItem={getLabelById(values.group_id, GROUPS)}
                value={values.group_id}
                onChange={(value) => handleChange({ target: { id: 'group_id', value } })}
              />
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Protein</label>
            <div className="lg:col-span-5">
              <Dropdown
                disabled={isAddLoading}
                id="proteins"
                mode="multiple"
                placeholder="Select proteins"
                options={PROTEINS}
                labelItem={getLabelById(values.proteins, PROTEINS)?.join(', ')}
                value={values.proteins}
                onChange={(value) => handleChange({ target: { id: 'proteins', value } })}
              />
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px]">Dietary restrictions</label>
            <div className="lg:col-span-5">
              <Dropdown
                disabled={isAddLoading}
                id="dietary_restrictions"
                fontSizeDropdown={13}
                mode="multiple"
                placeholder="Select dietary restrictions"
                labelItem={getLabelById(values.dietary_restrictions, DIETARY_RESTRICTIONS)?.join(', ')}
                options={DIETARY_RESTRICTIONS}
                value={values.dietary_restrictions}
                onChange={(value) => handleChange({ target: { id: 'dietary_restrictions', value } })}
              />
            </div>

            <label className="font-medium lg:col-span-2 pt-[10px] md:pl-[30px] lg:pl-[0px]">Modifiers</label>
            <div className="lg:col-span-5">
              <Dropdown
                disabled={isAddLoading}
                id="modifier_ids"
                mode="multiple"
                placeholder="Select Modifiers"
                options={MODIFIERS}
                loading={isModifierLoading}
                labelItem={getLabelById(values.modifier_ids, MODIFIERS)?.join(', ')}
                value={values.modifier_ids}
                onChange={(value) => handleChange({ target: { id: 'modifier_ids', value } })}
              />
            </div>

            <label className="font-medium lg:col-span-2">Track inventory</label>
            <div className="lg:col-span-5 flex-col space-y-[10px]">
              <CustomizedSwitch
                id="track_inventory"
                disabled={isAddLoading}
                onChange={(value) => handleChange({ target: { id: 'track_inventory', value } })}
                checked={values.track_inventory}
              />
              {values.track_inventory && (
                <div className="flex space-x-[10px]">
                  <div className="w-[102px]">
                    <InputText
                      disabled={isAddLoading}
                      id="in_stock"
                      placeholder="In stock"
                      value={values?.in_stock || ''}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="w-[102px]">
                    <InputText
                      disabled={isAddLoading}
                      id="low_stock"
                      placeholder="Low stock"
                      value={values?.low_stock || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:w-1/2 flex flex-col space-y-[10px] max-lg:pt-5">
            <span className="font-medium">Product image</span>
            <div className="flex flex-col h-[300px] w-[300px]">
              <div>
                {
                  <ImgCrop rotationSlider fillColor="transparent">
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={onChange}
                      onPreview={onPreview}
                      name="image_url"
                    >
                      {fileList.length < 1 && '+ Upload image'}
                    </Upload>
                  </ImgCrop>
                }
              </div>
            </div>
            <div className="pt-[10px] text-[11px] font-open-sans">
              <span>Image requirements: </span>
              <ul className="list-disc pl-5">
                <li>Minimum 1024 x 1024 pixels </li>
                <li>.png with transparent background</li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};
export default AddProduct;
